/** Shared Kitty look vs scale blocks — look can change without touching size. */

export const KITTY_ADULT =
  "adult catgirl, adult woman, not child, not loli";

export const KITTY_LOOK = [
  "tiny chaotic cybernetic android",
  KITTY_ADULT,
  "pale freckled skin",
  "violet tiger stripes on the face",
  "glowing violet eyes",
  "circular chest glow",
  "wine-violet braided cable hair",
  "gold-and-black cybernetic cat ears",
  "physical wine-violet tail",
  "compact athletic figure",
  "no breast inflation",
  "black neon cat-logo tank",
  "open black leather jacket",
  "black-and-gold cargo pants with KITTY on the pocket",
  "paw-print heels",
].join(", ");

export const KITTY_SCALES: Record<string, string> = {
  personal:
    "exactly 16 inches (41cm) tall, two hands tall, adult wooden chair as scale, she stands on the seat, chair back taller than her head, (human sized chair:1.4), (tiny woman on chair seat:1.6), one ruler only",
  palm: "exactly 16 inches (41cm) tall, two hands tall, fist-to-elbow length, whole body shorter than an adult forearm, head no larger than a knuckle, standing in an adult open palm, (16 inches tall:1.7), (whole body shorter than forearm:1.55), (head no larger than a knuckle:1.45), one ruler only",
  amazon:
    "exactly 16 inches (41cm) tall, knee-high on a standing adult, standing at a giant woman's shin, her head below mid-thigh, (tiny woman standing at giant woman's knee:1.6), (her head below mid-thigh:1.5), one ruler only",
  sheet:
    "exactly 16 inches (41cm) tall, standing next to an adult man as scale, 16 INCHES ruler, (16 inches tall:1.6), one ruler only",
  look: "solo character sheet, no scale partner, no giant, no palm, no chair",
};

export const KITTY_WEIGHTED: Record<string, string> = {
  personal:
    "(exactly 16 inches (41cm) tall:1.6), (two hands tall:1.4), (adult wooden chair as scale:1.4), (tiny woman on chair seat:1.6), (chair back taller than her head:1.4), (one ruler only:1.3)",
  palm: "(exactly 16 inches (41cm) tall:1.7), (two hands tall:1.5), (fist-to-elbow length:1.4), (whole body shorter than an adult forearm:1.55), (head no larger than a knuckle:1.45), (standing in an adult open palm:1.6), (one ruler only:1.3)",
  amazon:
    "(exactly 16 inches (41cm) tall:1.6), (knee-high on a standing adult:1.5), (tiny woman standing at giant woman's knee:1.6), (her head below mid-thigh:1.5), (one ruler only:1.3)",
  sheet:
    "(exactly 16 inches (41cm) tall:1.6), (standing next to an adult man as scale:1.4), (one ruler only:1.3)",
  look: "",
};

const BASE_NEG =
  "blurry, deformed, extra limbs, bad anatomy, cropped, out of frame, text, watermark, child, loli, toddler, baby";

const KITTY_NEG =
  "full-size Chaos Kitty, same-height couple, giantess flip, extra tiny figure, doll, gremlin, miniature doll, human ears, blonde hair, identical second catgirl, cat standing beside identical cat, breast inflation, huge breasts";

export function kittyLook(): string {
  return KITTY_LOOK;
}

export function kittyScale(modeId?: string): string {
  return KITTY_SCALES[modeId || "personal"] ?? KITTY_SCALES.personal;
}

export function kittyPrompt(modeId?: string): string {
  const scale = kittyScale(modeId);
  return scale ? `${KITTY_LOOK}, ${scale}` : KITTY_LOOK;
}

export function kittyWeighted(modeId?: string): string {
  return KITTY_WEIGHTED[modeId || "personal"] ?? "";
}

export function negativePack(hasKitty: boolean): string {
  return hasKitty ? `${BASE_NEG}, ${KITTY_NEG}` : BASE_NEG;
}
