/** Camera / ground / inject. Pair-fail copy lives in scale-lock.contract.json. */

import { LOCK, pairFail, rulerForBible } from "./contract";
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

const camera = LOCK.camera as Lines;
const ground = LOCK.ground as Lines;
const technique = LOCK.technique as Lines;

const SIT = new Set(["sit"]);

function sitting(p: LoomPick): boolean {
  return SIT.has(p.wardrobePoseId || "") || SIT.has(p.poseId || "");
}

function issue(id: string): LoomIssue {
  const p = pairFail(id)!;
  return {
    level: p.severity === "error" ? "hard" : "warn",
    code: p.id,
    message: p.detail,
    fixes: p.fixes ?? [],
  };
}

function cameraKey(p: LoomPick): string {
  if (p.poseId === "sheet" || p.kittyMode === "look") return "sheet";
  if (p.hasKitty) {
    if (p.kittyMode === "palm") return "kittyPalm";
    if (p.kittyMode === "amazon") return "kittyShin";
    if (p.kittyMode === "sheet") return "kittyPlate";
    if (p.kittyMode === "look") return "sheet";
    return "kittyOnSeat";
  }
  return p.cityScaleId;
}

function groundKey(p: LoomPick): string {
  if (p.poseId === "sheet" || p.kittyMode === "look") return "lookOnly";
  if (p.hasKitty) {
    if (p.kittyMode === "palm") return "kittyPalm";
    if (p.kittyMode === "amazon") return "kittyShin";
    if (p.kittyMode === "sheet") return "kittyPlate";
    return "kittyOnSeat";
  }
  if (sitting(p)) return "adultInChair";
  return "always";
}

function rulerBible(p: LoomPick): string {
  if (p.poseId === "sheet" || p.kittyMode === "look") return "lookOnly";
  if (p.hasKitty) return cameraKey(p);
  if (sitting(p)) return "adultInChair";
  return p.cityScaleId;
}

export function rulerLine(p: LoomPick): string {
  const r = rulerForBible(rulerBible(p));
  return r?.line ?? "";
}

export function loomCheck(p: LoomPick): LoomIssue[] {
  const out: LoomIssue[] = [];
  const kittyOnSeat =
    p.hasKitty && (p.kittyMode === "personal" || !p.kittyMode);

  if (kittyOnSeat && p.hasAdult && sitting(p)) {
    out.push(issue("seat-vs-chair"));
  } else if (
    p.hasKitty &&
    p.injectCity &&
    cityFightsKitty(p.cityScaleId) &&
    sitting(p)
  ) {
    out.push(issue("city-kitty-fight"));
  }

  if (p.injectCity && p.cityScaleId === "node" && p.hasKitty) {
    out.push(issue("city-node-kitty"));
  }

  return out;
}

export function cameraLine(p: LoomPick): string {
  const line = camera[cameraKey(p)] ?? camera.walk;
  const never = camera.never ? ` CAMERA LAW: ${camera.never}` : "";
  return `CAMERA: ${line}${never}`;
}

export function groundLine(p: LoomPick): string {
  const line = ground[groundKey(p)] ?? ground.always;
  return `GROUND: ${line}`;
}

export function techniqueLine(p: LoomPick): string {
  if (p.poseId === "sheet" || p.kittyMode === "look") {
    return technique.sheet ? `TECHNIQUE: ${technique.sheet}` : "";
  }
  const key = p.whereId && technique[p.whereId] ? p.whereId : p.cityScaleId;
  const line = technique[key] ?? technique.walk;
  return line ? `TECHNIQUE: ${line}` : "";
}

export function loomInject(p: LoomPick): string {
  return [cameraLine(p), groundLine(p), techniqueLine(p), rulerLine(p)]
    .filter(Boolean)
    .join(" ");
}

export function scaleNegative(_hasKitty: boolean): string {
  return (LOCK.negative as { scale?: string }).scale ?? "";
}

export const LOOM_CAMERA = LOCK;
