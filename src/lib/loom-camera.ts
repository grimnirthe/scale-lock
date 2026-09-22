/** Camera / ground / pair law. No roster. No family sheets. */

import bible from "@/data/loom-camera-lock.json";
import { cityFightsKitty, type ScaleId } from "./velora-scale";

export type LoomIssue = {
  level: "hard" | "warn";
  code: string;
  message: string;
  fixes: string[];
};

export type LoomPick = {
  hasKitty: boolean;
  kittyMode?: string;
  hasAdult: boolean;
  selectedCount: number;
  cityScaleId: ScaleId;
  injectCity: boolean;
  wardrobePoseId?: string;
  poseId?: string;
  isI2v: boolean;
  stillOk: boolean;
  whereId?: string;
};

type Lines = Record<string, string>;

const camera = bible.camera as Lines;
const ground = bible.ground as Lines;
const technique = bible.technique as Lines;

const SIT = new Set(["sit"]);

function sitting(p: LoomPick): boolean {
  return SIT.has(p.wardrobePoseId || "") || SIT.has(p.poseId || "");
}

function cameraKey(p: LoomPick): string {
  if (p.poseId === "sheet" || p.kittyMode === "look") return "sheet";
  if (p.hasKitty) {
    if (p.kittyMode === "palm") return "kitty-palm";
    if (p.kittyMode === "amazon") return "kitty-amazon";
    if (p.kittyMode === "sheet") return "kitty-sheet";
    if (p.kittyMode === "look") return "kitty-look";
    return "kitty-personal";
  }
  return p.cityScaleId;
}

function groundKey(p: LoomPick): string {
  if (p.poseId === "sheet") return "sheet";
  if (p.hasKitty) {
    if (p.kittyMode === "palm") return "kitty-palm";
    if (p.kittyMode === "amazon") return "kitty-amazon";
    if (p.kittyMode === "sheet") return "kitty-sheet";
    if (p.kittyMode === "look") return "sheet";
    return "kitty-personal";
  }
  return "adult";
}

function defaultRuler(p: LoomPick): string {
  const rulers = bible.rulers as { id: string; line: string }[];
  const byId = (id: string) => rulers.find((r) => r.id === id)?.line ?? "";
  if (p.hasKitty && p.kittyMode === "palm") return byId("forearm");
  if (p.hasKitty && (p.kittyMode === "personal" || !p.kittyMode)) {
    return byId("chair-seat");
  }
  if (p.whereId === "wood-door") return byId("door-handle");
  if (p.whereId === "eave" || p.cityScaleId === "walk") return byId("lamp");
  if (p.wardrobePoseId === "three-quarter") return byId("cup-palm");
  return byId("curb");
}

export function loomCheck(p: LoomPick): LoomIssue[] {
  const out: LoomIssue[] = [];
  const kittyOnSeat =
    p.hasKitty && (p.kittyMode === "personal" || !p.kittyMode);
  const hard = bible.pairs.hard as {
    id: string;
    message: string;
    fixes: string[];
  }[];
  const warn = bible.pairs.warn as { id: string; message: string }[];
  const hardBy = (id: string) => hard.find((h) => h.id === id)!;
  const warnBy = (id: string) => warn.find((w) => w.id === id)!;

  if (p.poseId === "sheet" && p.selectedCount !== 1) {
    const rule = hardBy("sheet-crowd");
    out.push({
      level: "hard",
      code: rule.id,
      message: rule.message,
      fixes: rule.fixes,
    });
  }

  if (kittyOnSeat && p.hasAdult && sitting(p)) {
    const rule = hardBy("in-chair-plus-on-seat");
    out.push({
      level: "hard",
      code: rule.id,
      message: rule.message,
      fixes: rule.fixes,
    });
  } else if (
    p.hasKitty &&
    p.injectCity &&
    cityFightsKitty(p.cityScaleId) &&
    sitting(p)
  ) {
    const rule = hardBy("kitty-plus-walk-sit");
    out.push({
      level: "hard",
      code: rule.id,
      message: rule.message,
      fixes: rule.fixes,
    });
  }

  if (p.injectCity && p.cityScaleId === "node" && p.hasKitty) {
    const rule = warnBy("node-plus-kitty");
    out.push({
      level: "warn",
      code: rule.id,
      message: rule.message,
      fixes: [],
    });
  }

  if (p.isI2v && !p.stillOk) {
    const rule = warnBy("i2v-without-still");
    out.push({
      level: "warn",
      code: rule.id,
      message: rule.message,
      fixes: ["Build a still that passes Check, then open I2V"],
    });
  }

  return out;
}

export function cameraLine(p: LoomPick): string {
  return camera[cameraKey(p)] ?? camera.walk;
}

export function groundLine(p: LoomPick): string {
  return ground[groundKey(p)] ?? ground.adult;
}

export function techniqueLine(p: LoomPick): string {
  if (p.poseId === "sheet" || p.kittyMode === "look") return technique.sheet;
  if (p.whereId && technique[p.whereId]) return technique[p.whereId];
  if (technique[p.cityScaleId]) return technique[p.cityScaleId];
  return technique.walk;
}

export function loomInject(p: LoomPick): string {
  return [cameraLine(p), groundLine(p), defaultRuler(p), techniqueLine(p)]
    .filter(Boolean)
    .join(" ");
}

export function scaleNegative(hasKitty: boolean): string {
  const pack = bible.negativeScale as string;
  return hasKitty
    ? pack
    : pack
        .replace(", no figurine on the cushion", "")
        .replace(", no giantess", "");
}

export const LOOM_CAMERA = bible;
