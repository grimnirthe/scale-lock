import { type Character } from "./roster";
import { kittyWeighted, negativePack } from "./locks";
import { poseById } from "./poses";

const PREFIX =
  "score_9, score_8_up, score_7_up, full body, floor visible, sharp focus, photorealistic";

function modeOf(char: Character, modeId?: string) {
  if (!char.modes) return undefined;
  return char.modes.find((m) => m.id === modeId) ?? char.modes[0];
}

export function lookLine(char: Character, modeId?: string): string {
  const m = modeOf(char, modeId);
  return m?.lookPrompt ?? char.lookPrompt ?? m?.basePrompt ?? char.basePrompt;
}

export function scaleLine(char: Character, modeId?: string): string {
  const m = modeOf(char, modeId);
  if (m?.ruler === "none") return m.scaleLock ?? "";
  if (m?.scaleLock) return m.scaleLock;
  if (char.scaleLock) return char.scaleLock;
  const display = m?.display ?? char.display.split("/")[0].trim();
  return `${display} ${char.name}`;
}

export function sheetLine(char: Character, modeId?: string): string {
  const m = modeOf(char, modeId);
  return m?.basePrompt ?? char.basePrompt;
}

export function buildCharacterSheet(
  selected: { char: Character; modeId?: string }[],
): string {
  if (selected.length !== 1) return "";
  const s = selected[0];
  const look = lookLine(s.char, s.modeId);
  const m = modeOf(s.char, s.modeId);
  const display = m?.display ?? s.char.display.split("/")[0].trim();
  const kitty = s.char.id === "kitty";
  const ruler = kitty
    ? "SCALE: 16-inch figure. One scale panel shows an adult wooden chair; she stands ON the seat, chair back taller than her head. Other panels are her alone, full body."
    : `SCALE: adult human walking scale, ${display} tall. Sit panel: IN a chair, feet on the floor, not perched on the cushion like a figurine.`;
  return [
    "Professional character reference sheet, one person only, identical face and identical outfit in every panel.",
    "LAYOUT: four views on one plate — front full body, side full body, back full body, close-up face. Even studio lighting, plain dark ground, small labels under each view.",
    ruler,
    "BREAK",
    s.char.name,
    display,
    look,
    "Identity still. Cloth first, face secondary. Photorealistic, sharp focus.",
    "NEVER: extra people, costume change between panels, adult tags, lingerie-armor, dollhouse, giantess, mecha, logos, family likeness, Night City trailer grit.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildFromSheets(
  selected: { char: Character; modeId?: string }[],
  scene: string,
  poseId?: string,
  wardrobe?: string,
  cityInject?: string,
): string {
  if (!selected.length) return "";
  const scales = selected.map((s) => scaleLine(s.char, s.modeId)).filter(Boolean);
  const looks = selected.map((s) => lookLine(s.char, s.modeId)).filter(Boolean);
  const names = selected.map((s) => s.char.name).join(", ");
  const pose = poseById(poseId || "stand-viewer");
  if (pose.id === "sheet") {
    return buildCharacterSheet(selected);
  }
  const extras = [
    cityInject ? "" : pose.prompt,
    scene.trim(),
    cityInject ? "" : wardrobe?.trim(),
    cityInject?.trim(),
  ].filter(Boolean);
  const place = extras.join(", ");
  const kitty = selected.find((s) => s.char.id === "kitty");
  const kittyMode = kitty ? modeOf(kitty.char, kitty.modeId)?.id : undefined;
  const sizeNote =
    kitty && kittyMode !== "look" ? ", extreme size difference, one ruler only" : "";
  const scaleBit = scales.join(", ");
  const lookBit = looks.join(", ");
  return `${PREFIX}${sizeNote}, ${scaleBit}, ${lookBit}, ${place} BREAK ${names}, looking at viewer, consistent identity`;
}

export function buildNegative(
  selected: { char: Character; modeId?: string }[],
): string {
  return negativePack(selected.some((s) => s.char.id === "kitty"));
}

export function buildWeighted(
  selected: { char: Character; modeId?: string }[],
): string {
  const kitty = selected.find((s) => s.char.id === "kitty");
  if (!kitty) return "";
  return kittyWeighted(kitty.modeId);
}
