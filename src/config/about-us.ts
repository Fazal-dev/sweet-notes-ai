// The more specific and personal you make it, the better the messages will feel.

export const YOUR_NAME = "Faju";
export const HER_NAME = "Kuttymma";

export const ABOUT_US = `

How we met: she see me in 2016 in english class for ordinary exam in DASDA intitution roomy sir class first time in red and blue shirt. after one year in ol examination she see me and follow me.
afer exam i go for 3 month course in academy (UDT) udunuvara devlopment trust she folow me and get my phone number from my friwnd and she message me and be friend

Our first date:
- in peradeni university this is not date but a meet she came to see me. she order bun and milk packet in canteen.

Things I love about her:
- The way she scrunches her nose when she's concentrating
- how she see in door when i leave her always.
- Her laugh — loud, unfiltered, contagious
- she is very emaotional sensitive , always cries when see sad movies 
- i love her voice
- how she calling me only (faju) in very cute way
- she is very organized girl.

Inside jokes:
- i call her kuttymma, alla bolaya ,gunfu panda

Places we've been together:
- That peradeni university under the tree
- Peradeni university
- inside bus back seat peradeni to geliyoya

Memories that mattered:
- i gave you  manyokka chips in peredeni university first time.

Her favorite things:
- Food: idiyappam,chocolates,stik chocholate
- Songs: vaseegara song,
- Movies: thalapthy vijay all flims specially thaliva

Things she's insecure about that I love:
- (she is very emotional i love that)
- she is over caring i love that
-

Our future:
- The trip to germany her favrit country.
- Moving in together in our private room you and me only.
- going to hajj together.
- help for poor peoples who dont have money together.

Her habits / quirks:
- Always cold, always stealing the blanket
- Sends me reals in instagram in day and night.if i didt see that send link to whatsapp chat.
- always tell me to check that real i share to you dont ignore my msgs.
- always ask me do you realy love me?
- always ask ia m okey for you .
- always tells me you never leave me alone right?
- always ask me are you angry to me ?
`;

export const THEMES = [ "funny", "memory","appreciation", "deep","future"] as const;
export type Theme = (typeof THEMES)[number];

export function themeForDate(date: Date): Theme {
  // Rotate themes deterministically by day-of-year
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return THEMES[dayOfYear % THEMES.length];
}
