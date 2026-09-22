import { describe, expect, it } from "vitest";
import { checkPrompt } from "./checker";
import { ROSTER } from "./roster";

const kitty = ROSTER.find((c) => c.id === "kitty")!;
const nymph = ROSTER.find((c) => c.id === "nymph")!;

describe("checkPrompt v0.3 keys", () => {
  it("sheet-crowd when plate pose has two names", () => {
    const r = checkPrompt({
      prompt: "character sheet, four views, Nymph and Kitty",
      selected: [
        { char: nymph, modeId: "sheet" },
        { char: kitty, modeId: "look" },
      ],
      isI2v: false,
      injectLocks: true,
      poseId: "sheet",
    });
    expect(r.findings.some((f) => f.id === "sheet-crowd")).toBe(true);
  });

  it("i2v-without-still warns with no still", () => {
    const r = checkPrompt({
      prompt: "slow push on a locked still, rain",
      selected: [{ char: nymph, modeId: "personal" }],
      isI2v: true,
      injectLocks: true,
      hasStill: false,
    });
    expect(r.findings.some((f) => f.id === "i2v-without-still")).toBe(true);
  });

  it("named rulers: door-handle + curb is multi-ruler", () => {
    const r = checkPrompt({
      prompt: "Nymph 5'2\", door handle at adult hip, curb to adult ankle, full body",
      selected: [{ char: nymph, modeId: "personal" }],
      isI2v: false,
      injectLocks: true,
    });
    expect(r.findings.some((f) => f.id === "multi-ruler")).toBe(true);
  });
});
