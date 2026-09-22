import { describe, expect, it } from "vitest";
import { LOCK, mentionedRulers, pairFail, rulerByBible, rulerForBible, rulers } from "./contract";

describe("v0.4 slot", () => {
  it("is 0.4-loom with rulerByBible", () => {
    expect(LOCK.version).toBe("0.4-loom");
    expect(rulerByBible()).toMatchObject({
      walk: "lamp",
      street: "curb",
      partner: "door-handle",
      kittyOnSeat: "chair-seat",
      kittyPalm: "forearm",
      lookbook: null,
      kittyShin: null,
      adultInChair: null,
    });
    expect(rulers().find((r) => r.id === "cup-palm")?.inject).toBe(false);
    expect(rulerForBible("kittyPalm")?.id).toBe("forearm");
    expect(rulerForBible("lookbook")).toBeUndefined();
    expect(pairFail("sheet-crowd")?.severity).toBe("error");
  });

  it("counts named rulers from prompt text", () => {
    const both = mentionedRulers(
      "door handle at hip, curb to adult ankle, photorealistic still",
    );
    expect(both.map((r) => r.id).sort()).toEqual(["curb", "door-handle"]);
  });
});
