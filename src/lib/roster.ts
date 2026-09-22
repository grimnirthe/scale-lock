import { sheet, type ParsedSheet } from "./sheets";
import { kittyPrompt, kittyScale, kittyLook } from "./locks";

export type HeightMode = {
  id: string;
  label: string;
  inches: number;
  display: string;
  help: string;
  ruler?: string;
  scaleLock?: string;
  lookPrompt?: string;
  outfit?: string;
  basePrompt?: string;
};

export type Character = {
  id: string;
  name: string;
  aliases: string[];
  display: string;
  inches: number;
  modes?: HeightMode[];
  hair: string;
  hairMust: string[];
  hairForbid: string[];
  eyes: string;
  ears?: string;
  earsForbid?: string[];
  build: string;
  ruler: string;
  scaleLock: string;
  lookPrompt?: string;
  outfit?: string;
  basePrompt: string;
  spawnRisk?: string[];
  fromSheet?: boolean;
};

function mustFromHair(hair: string): string[] {
  const h = hair.toLowerCase();
  const out: string[] = [];
  if (h.includes("crimson")) out.push("crimson");
  if (h.includes("violet")) out.push("violet");
  if (h.includes("pixie")) out.push("pixie");
  if (h.includes("blonde") || h.includes("blond")) out.push("blonde");
  if (h.includes("grey") || h.includes("gray")) out.push("grey");
  if (h.includes("streak")) out.push("streak");
  if (h.includes("salt")) out.push("salt");
  return out.slice(0, 2);
}

function fromParsed(
  id: string,
  parsed: ParsedSheet,
  extra: Partial<Character> = {},
): Character {
  const shortName = extra.name ?? parsed.name.split(/[–(]/)[0].trim();
  return {
    id,
    name: shortName,
    aliases: extra.aliases ?? [id, shortName.toLowerCase()],
    display: extra.display ?? parsed.display,
    inches: extra.inches ?? parsed.inches,
    modes: extra.modes,
    hair: extra.hair ?? parsed.hair,
    hairMust: extra.hairMust ?? mustFromHair(extra.hair ?? parsed.hair),
    hairForbid: extra.hairForbid ?? [],
    eyes: extra.eyes ?? parsed.eyes,
    ears: extra.ears,
    earsForbid: extra.earsForbid,
    build: extra.build ?? parsed.build,
    ruler: extra.ruler ?? "Full body, floor visible",
    scaleLock: extra.scaleLock ?? parsed.scaleLock,
    lookPrompt: extra.lookPrompt,
    outfit: extra.outfit ?? parsed.outfit,
    basePrompt: extra.basePrompt ?? parsed.basePrompt,
    spawnRisk: extra.spawnRisk,
    fromSheet: true,
  };
}

const nymphSheet = sheet("nymph")!;
const kittySheet = sheet("kitty")!;
const vesperSoft = sheet("vesper")!;
const vesperArmor = sheet("vesper-armor")!;

const KITTY_LOOK = kittyLook();

export const ROSTER: Character[] = [
  fromParsed("matt", sheet("matt")!, {
    name: "Matt",
    aliases: ["matt", "thegrimnir", "grimnir", "matthew"],
    hairForbid: ["blonde", "blond", "pixie", "crimson hair"],
    ruler: "Full body; knee = Kitty ceiling",
  }),
  fromParsed("nymph", nymphSheet, {
    name: "Nymph",
    aliases: ["nymph", "nyph"],
    display: "5'2\" personal / 6'0\" sheet / 6'6\" amazon",
    inches: 62,
    hairMust: ["pixie", "crimson"],
    hairForbid: ["long hair", "ponytail", "blonde", "bald"],
    modes: [
      {
        id: "personal",
        label: "5'2\" personal",
        inches: 62,
        display: "5'2\"",
        help: "Her own stills. Seed body. Not the tower.",
        outfit: nymphSheet.outfit,
        scaleLock: nymphSheet.scaleLock.replace(/6'0"/g, "5'2\""),
        basePrompt: nymphSheet.basePrompt.replace(/6'0"/g, "5'2\"").replace(/Exactly 6'0"/g, "5'2\""),
      },
      {
        id: "sheet",
        label: "6'0\" sheet",
        inches: 72,
        display: "6'0\"",
        help: "Matches the Master Sheet JSON.",
        outfit: nymphSheet.outfit,
        scaleLock: nymphSheet.scaleLock,
        basePrompt: nymphSheet.basePrompt,
      },
      {
        id: "amazon",
        label: "6'6\" amazon",
        inches: 78,
        display: "6'6\"",
        help: "Towering gens only. Knee is Kitty’s ceiling.",
        outfit: nymphSheet.outfit,
        scaleLock: nymphSheet.scaleLock.replace(/6'0"/g, "6'6\""),
        basePrompt: nymphSheet.basePrompt.replace(/6'0"/g, "6'6\""),
      },
    ],
  }),
  fromParsed("vee", sheet("vee")!, {
    name: "Vee",
    aliases: ["vee", "violet valkyrie"],
    hairMust: ["crimson", "long"],
    hairForbid: ["pixie", "short hair", "blonde"],
  }),
  fromParsed("velora", sheet("velora")!, {
    name: "Velora",
    aliases: ["velora", "runeweaver"],
    hairMust: ["violet"],
    hairForbid: ["pixie", "blonde"],
  }),
  fromParsed("starborn", sheet("starborn")!, {
    name: "Starborn",
    aliases: ["starborn", "star", "female v"],
    hairMust: ["crimson", "streak"],
    hairForbid: ["long hair", "blonde", "ponytail"],
  }),
  fromParsed("v", sheet("v")!, {
    name: "V",
    aliases: ["crimson oni", "the crimson oni"],
    hairMust: ["crimson"],
    hairForbid: ["long hair", "blonde"],
  }),
  fromParsed("kitty", kittySheet, {
    name: "Chaos Kitty",
    aliases: ["kitty", "chaos kitty", "ch4-os-k177y", "k177y"],
    display: "16\" chair / palm / shin / plate / look",
    inches: 16,
    hair: "Wine-violet braided cables, neon highlights",
    hairMust: ["violet", "wine"],
    hairForbid: ["blonde", "bald"],
    eyes: "Glowing violet cat eyes",
    ears: "Gold-and-black cybernetic cat ears",
    earsForbid: ["human ears"],
    ruler: "Adult wooden chair — she stands on the seat; back clears her ears",
    lookPrompt: KITTY_LOOK,
    scaleLock: kittyScale("personal"),
    outfit: "black cat-logo tank, open leather jacket, black-and-gold KITTY cargo pants, paw-print heels",
    spawnRisk: ["gremlin", "doll", "doll-sized", "miniature doll"],
    basePrompt: kittyPrompt("personal"),
    modes: [
      {
        id: "personal",
        label: "16\" chair",
        inches: 16,
        display: "16\" chair",
        help: "Solo still. Two hands tall. Adult wooden chair. She stands on the seat.",
        ruler: "chair",
        lookPrompt: KITTY_LOOK,
        scaleLock: kittyScale("personal"),
        basePrompt: kittyPrompt("personal") + ", full body, photorealistic",
      },
      {
        id: "palm",
        label: "16\" palm",
        inches: 16,
        display: "16\" palm",
        help: "Palm bible. Two hands tall. Whole body shorter than a forearm. Head ≤ knuckle. Solo ruler.",
        ruler: "palm",
        lookPrompt: KITTY_LOOK,
        scaleLock: kittyScale("palm"),
        basePrompt: kittyPrompt("palm") + ", full body, photorealistic",
      },
      {
        id: "amazon",
        label: "16\" shin",
        inches: 16,
        display: "16\" shin",
        help: "Knee bible. Two hands tall. Head at shin, below mid-thigh. Tall body is the stick. No chair.",
        ruler: "knee",
        lookPrompt: KITTY_LOOK,
        scaleLock: kittyScale("amazon"),
        basePrompt: kittyPrompt("amazon") + ", full body, photorealistic",
      },
      {
        id: "sheet",
        label: "16\" plate",
        inches: 16,
        display: "16\" plate",
        help: "Original 16\" plate. Adult man as ruler. Gold KITTY pants, paw heels.",
        ruler: "partner",
        lookPrompt: KITTY_LOOK,
        scaleLock: kittyScale("sheet"),
        basePrompt: kittyPrompt("sheet") + ", full body, photorealistic",
      },
      {
        id: "look",
        label: "look only",
        inches: 16,
        display: "look only",
        help: "Identity sheet. No scale partner. Do not pretend size is locked.",
        ruler: "none",
        lookPrompt: KITTY_LOOK,
        scaleLock: kittyScale("look"),
        basePrompt: kittyPrompt("look") + ", full body, photorealistic",
      },
    ],
  }),
  fromParsed("loom", sheet("loom")!, {
    name: "Loom",
    hairMust: ["dark", "long"],
    hairForbid: ["pixie", "blonde"],
  }),
  fromParsed("riven", sheet("riven")!, {
    name: "Riven",
    hairMust: ["crimson"],
    hairForbid: ["blonde", "pixie"],
  }),
  fromParsed("sable", sheet("sable")!, {
    name: "Sable",
    hairMust: ["crimson", "streak"],
    hairForbid: ["long hair", "blonde"],
  }),
  fromParsed("kaelith", sheet("kaelith")!, {
    name: "Kaelith",
    hairMust: ["crimson"],
    hairForbid: ["blonde", "pixie"],
  }),
  fromParsed("rune", sheet("rune")!, {
    name: "Rune",
    hairMust: ["ash", "brown"],
    hairForbid: ["pixie", "blonde"],
  }),
  fromParsed("aurora", sheet("aurora")!, {
    name: "Aurora",
    aliases: ["aurora", "solariel", "lumen"],
    hairMust: ["brown"],
    hairForbid: ["pixie", "crimson"],
  }),
  fromParsed("forge", sheet("forge")!, {
    name: "Forge",
    hairMust: ["brown", "ash"],
    hairForbid: ["blonde", "pixie"],
  }),
  fromParsed("tech", sheet("tech")!, {
    name: "Tech",
    hairMust: ["salt"],
    hairForbid: ["long hair", "crimson"],
  }),
  fromParsed("vesper", vesperSoft, {
    name: "Vesper",
    aliases: ["vesper"],
    display: "5'10\" standing / 6'0\" armor",
    inches: 70,
    hairMust: ["crimson", "long"],
    hairForbid: ["pixie", "blonde", "short hair"],
    modes: [
      {
        id: "soft",
        label: "5'10\" standing",
        inches: 70,
        display: "5'10\"",
        help: "Soft core from her Master Sheet. No armor.",
        outfit: vesperSoft.outfit,
        scaleLock: vesperSoft.scaleLock,
        basePrompt: vesperSoft.basePrompt,
      },
      {
        id: "armor",
        label: "6'0\" armor",
        inches: 72,
        display: "6'0\"",
        help: "Shadowveil Guardian Armor sheet. White-gold plate, obsidian panels. Two inches taller.",
        outfit: vesperArmor.outfit,
        scaleLock: vesperArmor.scaleLock,
        basePrompt: vesperArmor.basePrompt,
      },
    ],
  }),
  fromParsed("jaz", sheet("jaz")!, {
    name: "Jaz",
    aliases: ["jaz", "jasper"],
    hairMust: ["brown"],
    hairForbid: ["pixie", "blonde"],
  }),
  fromParsed("barnaby", sheet("barnaby")!, {
    name: "Barnaby",
    aliases: ["barnaby", "uncle b"],
    hairMust: ["white"],
    hairForbid: ["pixie", "crimson"],
  }),
  fromParsed("suno", sheet("suno")!, {
    name: "Suno",
    aliases: ["suno", "sonnet"],
    hairMust: ["brown", "long"],
    hairForbid: ["pixie", "crimson"],
  }),
];

export function findInPrompt(text: string, char: Character): boolean {
  const lower = text.toLowerCase();
  return char.aliases.some((a) => {
    const re = new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return re.test(lower) || lower.includes(a.toLowerCase());
  });
}

export const SAMPLE_PROMPT = `score_9, score_8_up, 6'6" Nymph, 5'2" Nymph, long blonde hair, ponytail, tiny gremlin, doll-sized, catgirl next to cat, Chaos Kitty standing next to her, palm of hand, adult wooden chair, human ears, huge breasts, BREAK Nymph with long hair, random hairstyle, 8 foot giant`;
