import { describe, expect, it } from "vitest";
import { LOCK, mentionedRulers, pairFail, rulers } from "./contract";

describe("v0.3 slot", () => {
  it("is 0.3-loom with named rulers and the two new pair-fails", () => {
    expect(LOCK.version).toBe("0.3-loom");
    expect(rulers().map((r) => r.id)).toEqual([
      "door-handle",
      "chair-seat",
      "curb",
      "cup-palm",
      "forearm",
      "lamp",
    ]);
    expect(pairFail("sheet-crowd")?.severity).toBe("error");
    expect(pairFail("i2v-without-still")?.severity).toBe("warn");
    expect(pairFail("sheet-crowd")?.fixes?.[0]).toBe("Leave one name checked");
  });

  it("counts named rulers from prompt text", () => {
    const both = mentionedRulers(
      "door handle at hip, curb to adult ankle, photorealistic still",
    );
    expect(both.map((r) => r.id).sort()).toEqual(["curb", "door-handle"]);
    expect(mentionedRulers("adult wooden chair, she stands on the seat").map((r) => r.id)).toContain(
      "chair-seat",
    );
  });
});
