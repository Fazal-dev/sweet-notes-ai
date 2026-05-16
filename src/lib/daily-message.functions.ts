import { createServerFn } from "@tanstack/react-start";
import { ABOUT_US, HER_NAME, YOUR_NAME, themeForDate, type Theme } from "@/config/about-us";

type DailyMessage = {
  date: string; // YYYY-MM-DD
  theme: Theme;
  message: string;
};

// In-memory cache so the same day returns the same message within a worker instance.
const cache = new Map<string, DailyMessage>();

function todayKey(): string {
  // Use UTC date as the daily key. Simple + consistent.
  return new Date().toISOString().slice(0, 10);
}

function buildPrompt(theme: Theme): string {
  return `You are writing a daily morning message from ${YOUR_NAME} to his girlfriend ${HER_NAME}.

Here is everything about them:
${ABOUT_US}

Write today's message. It should:
- Sound like a 25 year old guy texting, NOT a poet
- Be specific, not generic — reference real memories or real things about her from the doc above
- Be short (3 to 5 sentences max)
- Feel warm but natural, like something he'd actually send
- No emojis unless it really fits
- Do not start with "Good morning ${HER_NAME}" every time — vary the opening

Today's theme: ${theme}

Write ONLY the message itself. No preamble, no quotes, no explanation.`;
}

async function callGroq(prompt: string, apiKey: string): Promise<string> {

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq error ${res.status}: ${txt}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Groq returned empty content");
  return content;
}

export const getDailyMessage = createServerFn({ method: "GET" })
  .inputValidator((data: { force?: boolean } | undefined) => data ?? {})
  .handler(async ({ data }): Promise<DailyMessage> => {
    const key = todayKey();
    if (!data.force && cache.has(key)) return cache.get(key)!;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set — add it in Vercel Environment Variables");

    const date = new Date();
    const theme = themeForDate(date);
    const message = await callGroq(buildPrompt(theme), apiKey);

    const result: DailyMessage = { date: key, theme, message };
    cache.set(key, result);
    return result;
  });

export const getMeta = createServerFn({ method: "GET" }).handler(async () => ({
  yourName: YOUR_NAME,
  herName: HER_NAME,
}));
