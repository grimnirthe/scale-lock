/** Velora wardrobe bibles — loaded from her JSON. Inverted scale from Kitty. */

import bible from "@/data/velora-wardrobe-walk-scale.json";

export type Aspect = "2:3" | "16:9" | "3:2";

export type ScaleId = "walk" | "street" | "lookbook" | "partner" | "node";

export type WardrobePoseId = (typeof bible.poses)[number]["id"];

export const WARDROBE_BIBLE = bible;

export const SCALES: {
  id: ScaleId;
  label: string;
  use: string;
  aspect: Aspect;
  sentence: string;
  paragraph: string;
}[] = [
  {
    id: "walk",
    label: "Walk",
    use: "residents, fashion",
    aspect: "2:3",
    sentence: bible.scaleInvert.wardrobe,
    paragraph: `SCALE: ${bible.master.scale}`,
  },
  {
    id: "street",
    label: "Street",
    use: "city stills",
    aspect: "16:9",
    sentence: "Buildings 2–5 storeys, people knee-to-waist in frame, lamps at head height.",
    paragraph:
      "SCALE: street scale. Buildings 2–5 storeys. People knee-to-waist in frame. Lamps at head height. Architecture is Streamlined Moderne + Nordic, settled. One thin violet band on the building not the body. Camera at street, not aerial god-shot, not dollhouse.",
  },
  {
    id: "lookbook",
    label: "Lookbook",
    use: "Soft Law cards",
    aspect: "2:3",
    sentence: "Cloth first, 2:3, body fills the frame, architecture only as weather.",
    paragraph:
      "SCALE: lookbook. Cloth first. Body fills the frame. Architecture only as weather, city softened. Walking scale. Camera at chest, not a hero poster.",
  },
  {
    id: "partner",
    label: "Partner",
    use: "Bonded Chassis",
    aspect: "2:3",
    sentence: "Walking-scale shell beside a person, not mecha, not a drone toy.",
    paragraph:
      "SCALE: partner. Walking-scale shell beside a person, not mecha, not a drone toy. Door or second figure in frame so the shell cannot inflate. Walking scale.",
  },
  {
    id: "node",
    label: "Node",
    use: "architecture plates",
    aspect: "16:9",
    sentence: "Building is the subject; humans small; one thin violet band at storey-line.",
    paragraph:
      "SCALE: node. Building is the subject. Humans small. One violet band at storey-line. Architecture is Streamlined Moderne + Nordic, settled.",
  },
];

export const WHOS: { id: string; label: string; line: string }[] = [
  { id: "none", label: "None", line: "" },
  ...bible.jobs.map((j) => ({
    id: j.id,
    label: j.label,
    line: `${j.label}: ${j.chip}`,
  })),
];

export const WHERES: { id: string; label: string; prompt: string }[] = [
  {
    id: "wet-street",
    label: "Wet moderne street",
    prompt: bible.master.city,
  },
  {
    id: "wood-door",
    label: "Wood door",
    prompt: "full-size wooden door, porch lamp at head height, a real door not a toy hatch",
  },
  {
    id: "bay",
    label: "Bay",
    prompt: "workshop bay, bay door twice a person's height, grease and mended cloth",
  },
  {
    id: "eave",
    label: "Eave",
    prompt: "narrow eave just above head, over-mended street, rain is weather",
  },
];

export const WARDROBE_POSES = bible.poses.map((p) => ({
  id: p.id as WardrobePoseId,
  label: p.label,
  prompt: `POSE: ${p.lock}`,
  lock: p.lock,
}));

export const ASPECTS: { id: Aspect; label: string }[] = [
  { id: "2:3", label: "2:3 lookbook" },
  { id: "16:9", label: "16:9 street" },
  { id: "3:2", label: "3:2 street" },
];

export const CITY_NEVER = bible.master.never.join(", ");

export const FABRIC_BIBLE = `COAT: ${bible.fabric.coat}
BOOTS: ${bible.fabric.boots}
CLOTH: ${bible.fabric.cloth}`;

export type CityPick = {
  scaleId: ScaleId;
  whoId: string;
  whereId: string;
  poseId: WardrobePoseId;
  cloth: string;
  aspect: Aspect;
};

export function scaleById(id: ScaleId) {
  return SCALES.find((s) => s.id === id) ?? SCALES[0];
}

export function wardrobePoseById(id: WardrobePoseId) {
  return WARDROBE_POSES.find((p) => p.id === id) ?? WARDROBE_POSES[0];
}

function fabricBlock(clothPaste: string): string {
  if (clothPaste) return clothPaste;
  return `COAT: ${bible.fabric.coat} BOOTS: ${bible.fabric.boots} CLOTH: ${bible.fabric.cloth}`;
}

export function composeCity(pick: CityPick): {
  scale: string;
  cloth: string;
  pose: string;
  never: string;
  fashion: string;
  inject: string;
  aspect: Aspect;
  aspectNote: string;
} {
  const scale = scaleById(pick.scaleId);
  const who = WHOS.find((w) => w.id === pick.whoId) ?? WHOS[0];
  const where = WHERES.find((w) => w.id === pick.whereId) ?? WHERES[0];
  const pose = wardrobePoseById(pick.poseId);
  const clothPaste = pick.cloth.trim();
  const fabric = fabricBlock(clothPaste);
  const aspectNote = "ASPECT: 2:3 identity still. Cloth first, face secondary.";

  if (pick.scaleId === "walk") {
    const inject = [
      bible.master.promptPrefix,
      fabric,
      pose.lock,
      who.line,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      scale: `SCALE: ${bible.master.scale}`,
      cloth: `CLOTH: ${bible.master.cloth}`,
      pose: pose.prompt,
      never: CITY_NEVER,
      fashion: fabric,
      inject,
      aspect: "2:3",
      aspectNote,
    };
  }

  const inject = [
    scale.paragraph,
    fabric,
    pose.prompt,
    who.line,
    where.prompt,
    pick.aspect === "2:3" ? aspectNote : `ASPECT: ${pick.aspect}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    scale: scale.paragraph,
    cloth: `CLOTH: ${bible.master.cloth}`,
    pose: pose.prompt,
    never: CITY_NEVER,
    fashion: fabric,
    inject,
    aspect: pick.aspect || scale.aspect,
    aspectNote,
  };
}

export function cityFightsKitty(scaleId: ScaleId): boolean {
  return (
    scaleId === "walk" ||
    scaleId === "street" ||
    scaleId === "lookbook" ||
    scaleId === "partner"
  );
}
