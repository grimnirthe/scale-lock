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

export function scalePack(): string {
  return (contract.negative as { scale?: string }).scale ?? "";
}
