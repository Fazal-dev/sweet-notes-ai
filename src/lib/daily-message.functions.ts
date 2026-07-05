import { createServerFn } from "@tanstack/react-start";
import {
  ABOUT_US,
  HER_NAME,
  YOUR_NAME,
  RELATIONSHIP_START_DATE,
  themeForDate,
  specialDayForDate,
  daysSinceStart,
  type Theme,
} from "@/config/about-us";

export type DailyMessage = {
  date: string; // YYYY-MM-DD
  theme: string;
  themeLabel: string;
  message: string;
  dayCount: number;
  isSpecialDay: boolean;
  specialDayLabel?: string;
};

// In-memory store: today's message keyed by date
const cache = new Map<string, DailyMessage>();

// In-memory history log (all messages generated this session)
const history: DailyMessage[] = [];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const THEME_DESCRIPTIONS: Record<string, string> = {
  "how-we-met": "How we met",
  "first-meet": "Our first meeting",
  "her-voice": "Her voice",
  "her-laugh": "Her laugh",
  "missing-her": "Missing her",
  "future-germany": "Germany dream",
  "future-home": "Our future home",
  "hajj-together": "Hajj together",
  "her-reels": "Her reel habit",
  "reassurance": "Reassurance",
  "gunfu-panda": "Inside jokes",
  "manyokka-memory": "Manyokka memory",
  "bus-ride": "The bus ride",
  "her-sensitivity": "Her sensitivity",
  "organized": "Her organized self",
  "idiyappam": "Her favourite foods",
  "vijay-movies": "Vijay movies",
  "vaseegara": "Vaseegara",
  "helping-others": "Helping others together",
  "deep-love": "Deep love",
  "birthday": "🎂 Her Birthday",
  "first-message-anniversary": "💬 First Message Anniversary",
  "love-anniversary": "❤️ Love Anniversary",
};

function buildPrompt(theme: string, specialContext: string | null, date: Date): string {
  const dayNum = daysSinceStart(date);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  if (specialContext) {
    return `You are writing a daily morning message from ${YOUR_NAME} to his girlfriend ${HER_NAME}.

Here is everything about them:
${ABOUT_US}

Today is ${dateStr} — day ${dayNum} of them being together.

SPECIAL OCCASION CONTEXT:
${specialContext}

Write the message. It should:
- Sound like a 25 year old guy texting, NOT a poet
- Be warm, genuine, and personal — reference real memories or things about her
- Be short (3 to 5 sentences max)
- Feel like something he would actually send
- No emojis unless it truly fits

Write ONLY the message itself. No preamble, no quotes, no explanation.`;
  }

  return `You are writing a daily morning message from ${YOUR_NAME} to his girlfriend ${HER_NAME}.

Here is everything about them:
${ABOUT_US}

Today is ${dateStr} — day ${dayNum} of them being together.

Today's theme: "${theme}" — ${THEME_DESCRIPTIONS[theme] ?? theme}

Write today's message. It should:
- Sound like a 25 year old guy texting, NOT a poet
- Be specific to today's theme — reference real memories or real things about her from the doc above that relate to the theme
- Be short (3 to 5 sentences max)
- Feel warm but natural, like something he'd actually send
- No emojis unless it really fits
- Do not start with "Good morning ${HER_NAME}" every time — vary the opening
- Today's date: ${dateStr}, day ${dayNum} — you can mention "day ${dayNum}" naturally if it fits

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
      temperature: 0.95,
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

    const now = new Date();
    const specialDay = specialDayForDate(now);
    const theme = specialDay ? specialDay.theme : themeForDate(now);
    const themeLabel = THEME_DESCRIPTIONS[theme] ?? theme;
    const prompt = buildPrompt(theme, specialDay?.context ?? null, now);
    const message = await callGroq(prompt, apiKey);
    const dayCount = daysSinceStart(now);

    const result: DailyMessage = {
      date: key,
      theme,
      themeLabel,
      message,
      dayCount,
      isSpecialDay: !!specialDay,
      specialDayLabel: specialDay?.label,
    };

    cache.set(key, result);

    // Add to history (avoid duplicates for same date)
    const existingIdx = history.findIndex((h) => h.date === key);
    if (existingIdx >= 0) {
      history[existingIdx] = result;
    } else {
      history.unshift(result); // newest first
    }

    return result;
  });

export const getMeta = createServerFn({ method: "GET" }).handler(async () => ({
  yourName: YOUR_NAME,
  herName: HER_NAME,
  relationshipStart: RELATIONSHIP_START_DATE,
}));

export const getMessageHistory = createServerFn({ method: "GET" }).handler(
  async (): Promise<DailyMessage[]> => {
    return [...history];
  }
);
