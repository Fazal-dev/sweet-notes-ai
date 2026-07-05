// The more specific and personal you make it, the better the messages will feel.

export const YOUR_NAME = "Faju";
export const HER_NAME = "Kuttymma";

/** The day you first texted each other — used for the "Day X of us" counter */
export const RELATIONSHIP_START_DATE = "2018-04-05";

export const ABOUT_US = `
How we met: She first saw me in 2016 in English class for the ordinary exam at DASDA institution (Roomy sir's class). I was wearing a red and blue shirt. After one year, during the O/L examination, she saw me again and followed me. After the exam, I went for a 3-month course at UDT (Udunuwara Development Trust). She followed me there too, got my phone number from my friend, and messaged me herself — and that's how we became friends.

Our first meet:
- Peradeniya University. It wasn't a date but she came just to see me. She ordered a bun and a milk packet at the canteen.

Things I love about her:
- The way she scrunches her nose when she's concentrating
- How she always watches from the door when I leave
- Her laugh — loud, unfiltered, contagious
- She is very emotional and sensitive — always cries at sad movies
- I love her voice so much
- How she calls me "Faju" in that one cute, soft way only she does
- She is a very organized person
- She is over-caring and I love that about her

Inside jokes & nicknames:
- I call her kuttymma, alla bolaya, gunfu panda

Places we've been together:
- Peradeniya University, under a tree
- The bus — back seat, Peradeniya to Gelioya

Memories that mattered:
- I gave her manyokka chips in Peradeniya University for the first time
- She texted me first on April 5, 2018

Her favorite things:
- Food: idiyappam, chocolates, stick chocolate
- Songs: Vaseegara
- Movies: All Thalapathy Vijay films, especially Thalaiva

Things she does that I love:
- She sends me reels on Instagram day and night — if I don't see them, she sends the link to WhatsApp chat
- She always says "check that reel I shared, don't ignore my messages"
- She always asks "do you really love me?"
- She always asks "am I okay for you?"
- She always tells me "you'll never leave me alone, right?"
- She always asks "are you angry at me?"

Our future dreams:
- A trip to Germany — her favorite country
- Moving into our own private room — just you and me
- Going to Hajj together
- Helping poor people together
`;

export const THEMES = [
  "how-we-met",
  "first-meet",
  "her-voice",
  "her-laugh",
  "missing-her",
  "future-germany",
  "future-home",
  "hajj-together",
  "her-reels",
  "reassurance",
  "gunfu-panda",
  "manyokka-memory",
  "bus-ride",
  "her-sensitivity",
  "organized",
  "idiyappam",
  "vijay-movies",
  "vaseegara",
  "helping-others",
  "deep-love",
] as const;

export type Theme = (typeof THEMES)[number];

/** Special days that override the normal theme rotation */
export const SPECIAL_DAYS: Array<{
  month: number; // 1-indexed
  day: number;
  label: string;
  theme: string;
  context: string;
}> = [
  {
    month: 7,
    day: 4,
    label: "her birthday 🎂",
    theme: "birthday",
    context: `Today is Kuttymma's birthday! She was born on July 4, 2001. Write a warm, personal, heartfelt birthday message from Faju to Kuttymma. Reference something specific about her — her laugh, her voice, how she says "Faju", her organized nature, or their memories. Make her feel truly special today. Keep it genuine, not over-the-top.`,
  },
  {
    month: 4,
    day: 5,
    label: "first message anniversary 💬",
    theme: "first-message-anniversary",
    context: `Today is the anniversary of the first day Kuttymma texted Faju — April 5, 2018. She was brave enough to get his number from a friend and message him herself. That one message changed everything. Write a message that reflects on how that one text she sent started it all.`,
  },
  {
    month: 5,
    day: 22,
    label: "love anniversary ❤️",
    theme: "love-anniversary",
    context: `Today is Faju and Kuttymma's love anniversary — May 22, 2018. The day they became official. Write a romantic anniversary message that reflects on how far they've come, how much she means to him, and the future they're building together (Germany, their own home, Hajj, helping others).`,
  },
];

/** Returns a Date object shifted to Sri Lanka Time (UTC+5:30) so UTC methods return correct local date parts */
export function getSriLankaDate(date: Date = new Date()): Date {
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
}

export function themeForDate(date: Date): Theme {
  // Rotate themes deterministically by day-of-year
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return THEMES[dayOfYear % THEMES.length];
}

export function specialDayForDate(date: Date): (typeof SPECIAL_DAYS)[number] | null {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return SPECIAL_DAYS.find((s) => s.month === month && s.day === day) ?? null;
}

export function daysSinceStart(date: Date): number {
  const start = new Date(RELATIONSHIP_START_DATE + "T00:00:00Z").getTime();
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((now - start) / 86_400_000) + 1;
}
