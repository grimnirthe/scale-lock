import { describe, expect, it } from "vitest";
import { loomInject, rulerLine, type LoomPick } from "./loom-camera";

const base: LoomPick = {
  hasKitty: false,
  hasAdult: true,
  selectedCount: 1,
  cityScaleId: "walk",
  injectCity: true,
  isI2v: false,
  stillOk: false,
};

describe("rulerByBible inject", () => {
  it("walk injects lamp, not a second stick", () => {
    const line = rulerLine({ ...base, cityScaleId: "walk" });
    expect(line).toMatch(/porch lamp/i);
    expect(loomInject({ ...base, cityScaleId: "walk" })).toContain(line);
  });

  it("kittyOnSeat injects chair-seat", () => {
    expect(
      rulerLine({ ...base, hasKitty: true, kittyMode: "personal", cityScaleId: "walk" }),
    ).toMatch(/wooden chair/i);
  });

  it("palm injects forearm, not cup-palm", () => {
    const line = rulerLine({ ...base, hasKitty: true, kittyMode: "palm" });
    expect(line).toMatch(/forearm/i);
    expect(line).not.toMatch(/cup or strap/i);
  });

  it("adult in chair injects no named stick", () => {
    expect(
      rulerLine({ ...base, poseId: "sit", wardrobePoseId: "sit", cityScaleId: "walk" }),
    ).toBe("");
  });

  it("lookbook / shin / sheet have no named stick", () => {
    expect(rulerLine({ ...base, cityScaleId: "lookbook" })).toBe("");
    expect(rulerLine({ ...base, hasKitty: true, kittyMode: "amazon" })).toBe("");
    expect(rulerLine({ ...base, poseId: "sheet", selectedCount: 1 })).toBe("");
  });
});
