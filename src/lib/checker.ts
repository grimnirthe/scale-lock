import { type Character, findInPrompt } from "./roster";
import { kittyWeighted, negativePack } from "./locks";
import { CITY_NEVER, cityFightsKitty, type ScaleId } from "./velora-scale";
import { pairFinding, scalePack, mentionedRulers } from "./contract";

export type Severity = "error" | "warn" | "ok";
export type Verdict = "pass" | "soft-fail" | "hard-fail";

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  fixes?: string[];
};

export type CheckInput = {
  prompt: string;
  selected: { char: Character; modeId?: string }[];
  isI2v: boolean;
  injectLocks: boolean;
  cityScaleId?: ScaleId;
  poseId?: string;
  hasStill?: boolean;
};

export type CheckResult = {
  findings: Finding[];
  cleaned: string;
  negative: string;
  weighted: string;
  verdict: Verdict;
  score: { errors: number; warns: number; ok: number };
};

function inchesOf(sel: { char: Character; modeId?: string }): {
  inches: number;
  display: string;
} {
  if (sel.char.modes && sel.modeId) {
    const m = sel.char.modes.find((x) => x.id === sel.modeId);
    if (m) return { inches: m.inches, display: m.display };
  }
  if (sel.char.modes) {
    const m = sel.char.modes[0];
    return { inches: m.inches, display: m.display };
  }
  return { inches: sel.char.inches, display: sel.char.display.split("/")[0].trim() };
}

function modeOf(sel: { char: Character; modeId?: string }) {
  if (!sel.char.modes) return undefined;
  return sel.char.modes.find((x) => x.id === sel.modeId) ?? sel.char.modes[0];
}

function lookText(sel: { char: Character; modeId?: string }): string {
  const m = modeOf(sel);
  return m?.lookPrompt ?? sel.char.lookPrompt ?? "";
}

function scaleText(sel: { char: Character; modeId?: string }): string {
  const m = modeOf(sel);
  if (m?.scaleLock) return m.scaleLock;
  if (sel.char.basePrompt) return sel.char.basePrompt;
  const lock = m?.scaleLock ?? sel.char.scaleLock;
  const h = inchesOf(sel);
  if (sel.char.id === "kitty") return lock;
  return `${h.display} ${sel.char.name}, ${lock}`;
}

function lockText(sel: { char: Character; modeId?: string }): string {
  const look = lookText(sel);
  const scale = scaleText(sel);
  if (look && scale && look !== scale) return `${scale}, ${look}`;
  return scale || look;
}

function parseHeightMentions(text: string): { raw: string; inches: number }[] {
  const out: { raw: string; inches: number }[] = [];
  const ft = text.matchAll(/(\d+)\s*(?:'|ft|foot|feet)\s*(\d+)?/gi);
  for (const m of ft) {
    const feet = Number(m[1]);
    const inch = m[2] ? Number(m[2]) : 0;
    if (feet >= 4 && feet <= 9) {
      out.push({ raw: m[0], inches: feet * 12 + inch });
    }
  }
  const inchOnly = text.matchAll(/(\d+(?:\.\d+)?)\s*(?:inch(?:es)?|"|”)\b/gi);
  for (const m of inchOnly) {
    const n = Number(m[1]);
    if (n >= 10 && n <= 96) out.push({ raw: m[0], inches: n });
  }
  const cm = text.matchAll(/(\d+)\s*cm\b/gi);
  for (const m of cm) {
    const n = Math.round(Number(m[1]) / 2.54);
    if (n >= 10 && n <= 96) out.push({ raw: m[0], inches: n });
  }
  return out;
}

function splitBreak(prompt: string): { before: string; after: string; hasBreak: boolean } {
  const idx = prompt.search(/\bBREAK\b/i);
  if (idx === -1) return { before: prompt, after: "", hasBreak: false };
  return {
    before: prompt.slice(0, idx),
    after: prompt.slice(idx + 5),
    hasBreak: true,
  };
}

function tagCount(chunk: string): number {
  return chunk
    .split(/,|\n/)
    .map((t) => t.trim())
    .filter(Boolean).length;
}

function dedupeTags(prompt: string): string {
  const { before, after, hasBreak } = splitBreak(prompt);
  const dedupe = (s: string) => {
    const seen = new Set<string>();
    const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
    const kept: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) continue;
      seen.add(key);
      kept.push(p);
    }
    return kept.join(", ");
  };
  if (!hasBreak) return dedupe(before);
  return `${dedupe(before)} BREAK ${dedupe(after)}`.trim();
}

function hasRuler(text: string): {
  chair: boolean;
  palm: boolean;
  stick: boolean;
  knee: boolean;
  partner: boolean;
} {
  const t = text.toLowerCase();
  return {
    chair: /\bchair\b/.test(t),
    palm: /\b(palm|forearm|knuckle)\b/.test(t),
    stick: /\b(ruler|yardstick|measuring)\b/.test(t),
    knee: /\b(knee|shin|mid-thigh|mid thigh)\b/.test(t),
    partner: /\b(adult man|standing next to)\b/.test(t),
  };
}

export function checkPrompt(input: CheckInput): CheckResult {
  const findings: Finding[] = [];
  const prompt = input.prompt;
  const lower = prompt.toLowerCase();
  const selected = input.selected;

  const emptyResult = (finding: Finding): CheckResult => ({
    findings: [finding],
    cleaned: "",
    negative: negativePack(selected.some((s) => s.char.id === "kitty")),
    weighted: "",
    verdict: "hard-fail",
    score: { errors: 1, warns: 0, ok: 0 },
  });

  if (!prompt.trim()) {
    return emptyResult({
      id: "empty",
      severity: "error",
      title: "No prompt",
      detail: "Paste a prompt to check.",
    });
  }

  const detected = selected.length ? selected : [];
  const mentions = parseHeightMentions(prompt);
  const rulers = hasRuler(prompt);
  const rulerCount = [rulers.chair, rulers.palm, rulers.stick, rulers.knee].filter(
    Boolean,
  ).length;

  if (input.poseId === "sheet" && selected.length !== 1) {
    findings.push(pairFinding("sheet-crowd"));
  } else if (
    /\b(character (sheet|reference)|four views)\b/i.test(prompt) &&
    selected.length > 1
  ) {
    findings.push(pairFinding("sheet-crowd"));
  }
  if (input.isI2v && !input.hasStill) {
    findings.push(pairFinding("i2v-without-still"));
  }

  const kitty = detected.find((s) => s.char.id === "kitty");
  const others = detected.filter((s) => s.char.id !== "kitty");
  const sizeWords =
    /\b(tiny|miniature|size difference|extreme size|giant|towering|knee height)\b/i.test(
      prompt,
    );

  if (kitty) {
    const k = inchesOf(kitty);
    const km = modeOf(kitty);
    const rulerPref = km?.ruler ?? "chair";
    const has16 = mentions.some((m) => Math.abs(m.inches - 16) <= 1);

    if (rulerPref === "none") {
      findings.push({
        id: "look-only",
        severity: "warn",
        title: "Look-only — scale not locked",
        detail: "Identity sheet. No chair, palm, or knee. Do not treat this as a size lock.",
      });
      if (rulers.chair || rulers.palm || rulers.knee) {
        findings.push(pairFinding("look-has-ruler"));
      }
      if (others.length) {
        findings.push(pairFinding("look-has-partner"));
      }
    } else if (!has16) {
      findings.push({
        id: "kitty-height",
        severity: "error",
        title: "Kitty height missing",
        detail: `Lock her at 16 inches (${k.display}). Cute-small without a number is not the bible.`,
      });
    } else {
      findings.push({
        id: "kitty-height-ok",
        severity: "ok",
        title: "Kitty height present",
        detail: `16-inch lock found (${km?.label ?? "sheet"}).`,
      });
    }

    const hasAdult = /\badult (catgirl|cat-girl|woman|man)\b/i.test(prompt);
    if (!hasAdult && rulerPref !== "none") {
      findings.push({
        id: "kitty-adult",
        severity: "error",
        title: "Adult ID missing",
        detail: "Need adult catgirl / adult woman in the prompt. Not child, not loli.",
      });
    } else if (hasAdult) {
      findings.push({
        id: "kitty-adult-ok",
        severity: "ok",
        title: "Adult ID present",
        detail: "Adult catgirl lock found.",
      });
    }

    if (rulerPref === "knee") {
      if (!rulers.knee) {
        findings.push({
          id: "kitty-ruler",
          severity: "error",
          title: "Knee bible needs a body ruler",
          detail:
            "Kitty at 16\" against a full-size body: her head at shin / below mid-thigh. Chair-only reads as a solo still.",
        });
      } else {
        findings.push({
          id: "kitty-ruler-ok",
          severity: "ok",
          title: "Shin ruler present",
          detail: "Amazon gens: tall body is the stick.",
        });
      }
      if (rulers.chair && rulers.knee) {
        findings.push(pairFinding("ruler-fight"));
      }
      if (rulers.palm && rulers.knee) {
        findings.push(pairFinding("ruler-fight"));
      }
    } else if (rulerPref === "palm") {
      if (!rulers.palm) {
        findings.push({
          id: "kitty-ruler",
          severity: "error",
          title: "Palm bible needs a hand",
          detail: "Whole body shorter than a forearm. Head no larger than a knuckle.",
        });
      } else {
        findings.push({
          id: "kitty-ruler-ok",
          severity: "ok",
          title: "Palm ruler present",
          detail: "Palm bible: she fits in the hand.",
        });
      }
      if (others.length) {
        findings.push(pairFinding("palm-has-partner"));
      }
      if (rulers.chair || rulers.knee) {
        findings.push(pairFinding("ruler-fight"));
      }
    } else if (rulerPref === "partner") {
      if (!rulers.partner && !rulers.knee) {
        findings.push({
          id: "kitty-ruler",
          severity: "error",
          title: "Plate needs an adult as scale",
          detail: "Standing next to an adult man. 16-inch ruler. Not a toy next to a toy.",
        });
      }
    } else if (rulerPref === "chair") {
      if (!rulers.chair && !rulers.knee && !rulers.stick) {
        findings.push({
          id: "kitty-ruler",
          severity: "error",
          title: "No working ruler",
          detail:
            "Personal / sheet: adult wooden chair, she stands on the seat, back clears her ears. Palm shots read 8–12 inches.",
        });
      }
    }

    if (rulers.palm && (rulers.chair || rulers.knee) && rulerPref !== "palm") {
      findings.push(pairFinding("ruler-fight"));
    } else if (rulers.palm && !rulers.chair && rulerPref === "chair") {
      findings.push({
        id: "palm-only",
        severity: "warn",
        title: "Palm ruler",
        detail: "Palm is holdable-scale, not the 16-inch chair bible. Switch to 16\" palm.",
      });
    }

    const hasTiny = /\b(tiny|miniature|16 inch)\b/i.test(prompt);
    const hasGiant = /\b(giant|towering|giantess)\b/i.test(prompt);
    const hasToys = /\b(mini-figure|minifigure|action figure|toy)\b/i.test(prompt);
    if (hasTiny && hasGiant && hasToys) {
      findings.push(pairFinding("scale-pile"));
    } else if (hasToys && (hasTiny || hasGiant)) {
      findings.push({
        id: "scale-toys",
        severity: "error",
        title: "Toy scale fighting the bible",
        detail: "Mini-figures / toys mix a second scale. Drop them.",
      });
    } else if (hasGiant && rulerPref !== "knee" && rulerPref !== "partner" && rulerPref !== "none") {
      findings.push({
        id: "scale-giant",
        severity: "warn",
        title: "Giant in a non-knee shot",
        detail: "Giant belongs on the shin / plate bibles. Chair and palm are solo.",
      });
    }

    const catFlip =
      /\b(catgirl|cat-girl|cat girl|kitty).{0,48}\b(cat|kitten)\b|\b(cat|kitten).{0,48}\b(catgirl|cat-girl|kitty)\b/i.test(
        prompt,
      );
    const catSized = /\b(cat-sized|cat sized|she is cat-sized)\b/i.test(prompt);
    if (catFlip && !catSized) {
      findings.push(pairFinding("cat-flip"));
    }

    if (/\b(huge breasts|massive breasts|hyper breasts|breast inflation)\b/i.test(prompt)) {
      findings.push({
        id: "inflation",
        severity: "error",
        title: "Bust inflation",
        detail: "Kitty lock is compact athletic. Two hands tall. No inflation.",
      });
    }

    for (const word of kitty.char.spawnRisk ?? []) {
      if (lower.includes(word)) {
        findings.push({
          id: `spawn-${word}`,
          severity: "warn",
          title: `Spawn risk: “${word}”`,
          detail: `That word tends to add an extra tiny figure. Prefer “tiny chaotic cybernetic android”.`,
        });
      }
    }
  } else if (sizeWords && rulerCount === 0) {
    findings.push({
      id: "size-no-ruler",
      severity: "warn",
      title: "Size talk, no ruler",
      detail: "Size difference without a chair, ruler, or knee lock. The model will guess.",
    });
  }

  const cityScale = input.cityScaleId;
  if (cityScale && kitty) {
    const km = modeOf(kitty);
    const kittyInText =
      findInPrompt(prompt, kitty.char) || /\b16\s*inch/i.test(prompt);
    if (kittyInText && km?.ruler !== "none" && cityFightsKitty(cityScale)) {
      findings.push(pairFinding("city-kitty-fight"));
    } else if (kittyInText && cityScale === "node") {
      findings.push(pairFinding("city-node-kitty"));
    }
  } else if (cityScale && !kitty) {
    findings.push({
      id: "city-scale-ok",
      severity: "ok",
      title: `City scale: ${cityScale}`,
      detail: "Walk-in vs door / lamp. Hem clears the puddle. In the chair, not on the seat.",
    });
  }

  const onSeat = /\b(on the seat|on the cushion|standing on the seat|perched on the (seat|cushion))\b/i.test(
    prompt,
  );
  const inChair = /\b(in the chair|sits in a chair|seated in the chair|back against the backrest)\b/i.test(
    prompt,
  );
  if (onSeat && inChair) {
    findings.push(pairFinding("seat-vs-chair"));
  }

  const namedRulers = mentionedRulers(prompt);
  if (!kitty && (namedRulers.length > 1 || rulerCount > 1)) {
    findings.push({
      id: "multi-ruler",
      severity: "warn",
      title: "Multiple rulers",
      detail:
        namedRulers.length > 1
          ? `One ruler per image. Hits: ${namedRulers.map((r) => r.id).join(", ")}.`
          : "One ruler per image.",
    });
  }

  if (
    !kitty &&
    /\b(huge breasts|massive breasts|hyper breasts|breast inflation)\b/i.test(prompt)
  ) {
    findings.push({
      id: "inflation-look",
      severity: "warn",
      title: "Bust inflation",
      detail: "Identity stills: compact athletic. Drop inflation.",
    });
  }

  for (const sel of detected) {
    const h = inchesOf(sel);
    const named = findInPrompt(prompt, sel.char);
    if (!named && detected.length) {
      findings.push({
        id: `name-${sel.char.id}`,
        severity: "warn",
        title: `${sel.char.name} selected but unnamed`,
        detail: "The model will not know who the lock belongs to.",
      });
    }

    const nearbyHeights = mentions.filter((m) => Math.abs(m.inches - h.inches) <= 1);
    const otherHeights = detected
      .filter((s) => s.char.id !== sel.char.id)
      .map((s) => inchesOf(s).inches);
    const conflicting = mentions.filter((m) => {
      const d = Math.abs(m.inches - h.inches);
      if (d < 6 || m.inches < 48) return false;
      if (otherHeights.some((o) => Math.abs(o - m.inches) <= 1)) return false;
      return true;
    });

    if (sel.char.id !== "kitty") {
      if (named && nearbyHeights.length === 0 && mentions.length > 0 && conflicting.length) {
        findings.push({
          id: `height-fight-${sel.char.id}`,
          severity: "error",
          title: `${sel.char.name} height fight`,
          detail: `Locked ${h.display}, but the prompt also has ${conflicting.map((c) => c.raw).join(", ")}.`,
        });
      } else if (named && nearbyHeights.length === 0) {
        findings.push({
          id: `height-missing-${sel.char.id}`,
          severity: "warn",
          title: `${sel.char.name} height not written`,
          detail: `Write ${h.display} as a number. Vague “tall” does not lock.`,
        });
      } else if (named && nearbyHeights.length) {
        findings.push({
          id: `height-ok-${sel.char.id}`,
          severity: "ok",
          title: `${sel.char.name} height matches`,
          detail: h.display,
        });
      }
    }

    if (sel.char.modes && sel.char.id === "nymph") {
      const has52 = mentions.some((m) => Math.abs(m.inches - 62) <= 1);
      const has66 = mentions.some((m) => Math.abs(m.inches - 78) <= 1);
      const has60 = mentions.some((m) => Math.abs(m.inches - 72) <= 1);
      const count = [has52, has66, has60].filter(Boolean).length;
      if (count > 1) {
        findings.push(pairFinding("nymph-mode-fight"));
        const idx = findings.findIndex((f) => f.id === `height-ok-${sel.char.id}`);
        if (idx >= 0) findings.splice(idx, 1);
      }
    }

    for (const bad of sel.char.hairForbid) {
      if (!lower.includes(bad.toLowerCase())) continue;
      const ownedByOther = detected.some((s) => {
        if (s.char.id === sel.char.id) return false;
        const blob = `${s.char.hair} ${s.char.scaleLock} ${s.char.hairMust.join(" ")}`.toLowerCase();
        return blob.includes(bad.toLowerCase());
      });
      if (ownedByOther) continue;
      findings.push({
        id: `hair-${sel.char.id}-${bad}`,
        severity: "error",
        title: `${sel.char.name} hair mismatch`,
        detail: `Prompt has “${bad}”. Locked hair: ${sel.char.hair}.`,
      });
    }
    if (sel.char.hairMust.length && named) {
      const missing = sel.char.hairMust.filter((k) => !lower.includes(k.toLowerCase()));
      if (missing.length === sel.char.hairMust.length) {
        findings.push({
          id: `hair-lock-${sel.char.id}`,
          severity: "warn",
          title: `${sel.char.name} hair lock weak`,
          detail: `None of ${sel.char.hairMust.join(", ")} appear. Locked: ${sel.char.hair}.`,
        });
      }
    }
    for (const bad of sel.char.earsForbid ?? []) {
      if (lower.includes(bad.toLowerCase())) {
        findings.push({
          id: `ears-${sel.char.id}`,
          severity: "error",
          title: `${sel.char.name} ears mismatch`,
          detail: `Prompt has “${bad}”. Locked: ${sel.char.ears}.`,
        });
      }
    }
  }

  const { before, hasBreak } = splitBreak(prompt);
  const nTags = tagCount(before);
  if (nTags > 45) {
    findings.push({
      id: "tag-bloat",
      severity: "warn",
      title: "Too many tags before BREAK",
      detail: `${nTags} chunks before BREAK. Scale and identity get drowned. Keep rulers and heights first.`,
    });
  }
  if (!hasBreak && nTags > 25) {
    findings.push({
      id: "no-break",
      severity: "warn",
      title: "No BREAK",
      detail: "Put scale + identity before BREAK, scene after.",
    });
  }

  if (input.isI2v) {
    const tinyHits = (lower.match(/\btiny\b/g) || []).length;
    if (tinyHits >= 3) {
      findings.push({
        id: "i2v-reargue",
        severity: "warn",
        title: "I2V re-argues scale",
        detail: "The still is the scale. Strip repeated tiny/height tags from the motion prompt.",
      });
    }
    findings.push({
      id: "i2v-note",
      severity: "ok",
      title: "I2V mode",
      detail: "Motion only after the still. Identity lives in frame one.",
    });
  }

  const rawParts = prompt.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
  const dupes = rawParts.filter((p, i) => rawParts.indexOf(p) === i && rawParts.lastIndexOf(p) !== i);
  const uniqueDupes = [...new Set(dupes)];
  if (uniqueDupes.length >= 3) {
    findings.push({
      id: "dupes",
      severity: "warn",
      title: "Duplicate tags",
      detail: `Repeats: ${uniqueDupes.slice(0, 8).join(", ")}${uniqueDupes.length > 8 ? "…" : ""}`,
    });
  }

  let cleaned = prompt.trim();
  if (input.isI2v) {
    cleaned = cleaned
      .replace(/\(tiny[^)]*\):\s*[\d.]+\)/gi, "")
      .replace(/\btiny\b/gi, "")
      .replace(/\s{2,}/g, " ");
  }

  if (input.injectLocks && detected.length) {
    const scales: string[] = [];
    const looks: string[] = [];
    for (const sel of detected) {
      const s = scaleText(sel);
      const l = lookText(sel);
      if (s) scales.push(s);
      if (l) looks.push(l);
    }
    const lockBlock = [...scales, ...looks].filter(Boolean).join(", ");
    if (hasBreak) {
      const parts = cleaned.split(/\bBREAK\b/i);
      cleaned = `${lockBlock}, ${parts[0].trim()} BREAK ${parts.slice(1).join(" BREAK ").trim()}`;
    } else {
      cleaned = `${lockBlock} BREAK ${cleaned}`;
    }
  }

  cleaned = dedupeTags(cleaned).replace(/\s+,/g, ",").replace(/,\s*,/g, ",");

  const errors = findings.filter((f) => f.severity === "error").length;
  const warns = findings.filter((f) => f.severity === "warn").length;
  const ok = findings.filter((f) => f.severity === "ok").length;
  const verdict: Verdict = errors ? "hard-fail" : warns ? "soft-fail" : "pass";

  if (!errors && !warns) {
    findings.unshift({
      id: "clean",
      severity: "ok",
      title: "Locks hold",
      detail: "No height fights, no identity clashes in the selected set.",
    });
  }

  const kittySel = detected.find((s) => s.char.id === "kitty");
  const kittyRuler =
    kittySel && (modeOf(kittySel)?.ruler ?? "chair") !== "none";
  const cityNeg =
    input.cityScaleId && !(kittyRuler && cityFightsKitty(input.cityScaleId))
      ? `, ${CITY_NEVER}`
      : "";

  return {
    findings,
    cleaned,
    negative: `${negativePack(Boolean(kittySel))}${cityNeg}, ${scalePack()}`,
    weighted: kittySel ? kittyWeighted(kittySel.modeId) : "",
    verdict,
    score: { errors, warns, ok: ok + (errors || warns ? 0 : 1) },
  };
}
