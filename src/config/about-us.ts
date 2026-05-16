// 💌 EDIT THIS FILE — this is the only thing the AI uses to write her daily message.
// The more specific and personal you make it, the better the messages will feel.

export const YOUR_NAME = "Faju";
export const HER_NAME = "Kuttymma";

export const ABOUT_US = `
[Replace this with your real "About Us" doc.]

How we met:
- (e.g. We met at Sarah's birthday in October 2022. She was wearing the green dress and laughed at my terrible joke about the DJ.)

Our first date:
- (Where you went, what she ordered, the moment you knew.)

Things I love about her:
- The way she scrunches her nose when she's concentrating
- How she always steals my hoodies but pretends she didn't
- Her laugh — loud, unfiltered, contagious
- (add 5-10 more, be specific)

Inside jokes:
- "the pigeon incident"
- calling each other "goose"
- (etc.)

Places we've been together:
- That tiny ramen spot in Shoreditch
- The Lisbon trip where we got lost looking for that viewpoint
- (etc.)

Memories that mattered:
- The night we stayed up until 4am talking on the kitchen floor
- The fight we had in March that ended with us laughing
- (etc.)

Her favorite things:
- Food: pad thai, dark chocolate, oat lattes
- Songs: (artists / songs she loops)
- Movies: (her comfort films)

Things she's insecure about that I love:
- (the things she thinks are flaws — write why you love them)

Our future:
- The trip to Japan we keep talking about
- Moving in together next spring
- (your shared dreams)

Her habits / quirks:
- Always cold, always stealing the blanket
- Sends me TikToks at 1am
- (etc.)
`;

export const THEMES = ["memory", "future", "appreciation", "funny", "deep"] as const;
export type Theme = (typeof THEMES)[number];

export function themeForDate(date: Date): Theme {
  // Rotate themes deterministically by day-of-year
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return THEMES[dayOfYear % THEMES.length];
}
