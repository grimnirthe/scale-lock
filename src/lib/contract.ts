/** Single lock table. Loom writes. Nymph commits. No parallel bible. */

import contract from "@/data/scale-lock.contract.json";

export const LOCK = contract;

export type PairFail = {
  id: string;
  a: string;
  b: string;
  severity: "error" | "warn";
  detail: string;
  fixes?: string[];
};

export type Ruler = {
  id: string;
  line: string;
};

export function pairFail(id: string): PairFail | undefined {
  return (contract.pairFail as PairFail[]).find((p) => p.id === id);
}

export function pairFinding(id: string) {
  const p = pairFail(id)!;
  return {
    id: p.id,
    severity: p.severity,
    title: `${p.a} vs ${p.b}`,
    detail: p.detail,
    fixes: p.fixes,
  };
}

export function rulers(): Ruler[] {
  return ((contract as { rulers?: Ruler[] }).rulers) ?? [];
}

/** Hits named sticks from the slot. One ruler per image. */
export function mentionedRulers(text: string): Ruler[] {
  const t = text.toLowerCase();
  return rulers().filter((r) => {
    const words = r.id.split("-").filter(Boolean);
    if (words.length && words.every((w) => new RegExp(`\\b${w}\\b`, "i").test(t))) {
      return true;
    }
    const lead = r.line
      .replace(/^RULER:\s*/i, "")
      .split(/[.;]/)[0]
      .trim()
      .toLowerCase();
    return lead.length > 8 && t.includes(lead);
  });
}

export function scalePack(): string {
  return (contract.negative as { scale?: string }).scale ?? "";
}
