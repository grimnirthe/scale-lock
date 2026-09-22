const NSFW =
  /\b(breast|breasts|boob|cleavage|cock|penis|pussy|futa|futanari|nipple|nude|naked|genital|aroused|voluptuous|hyper-voluptuous|milky)\b/i;

function clip(s: string, n = 120): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const i = cut.lastIndexOf(" ");
  return (i > 40 ? cut.slice(0, i) : cut).trim();
}

export function sanitize(text: string): string {
  return text
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !NSFW.test(p) && !/\bgremlin\b/i.test(p))
    .join(", ");
}

export function parseHeight(raw: string): { inches: number; display: string } {
  const t = raw || "";
  const inchOnly = t.match(/(\d+)\s*inch/i);
  if (inchOnly) {
    const n = Number(inchOnly[1]);
    return { inches: n, display: `${n}"` };
  }
  const range = t.match(/(\d+)\s*'\s*(\d+)\s*"?\s*[-–]\s*(\d+)\s*'\s*(\d+)/);
  if (range) {
    const hi = Number(range[3]) * 12 + Number(range[4]);
    return {
      inches: hi,
      display: `${range[1]}'${range[2]}"–${range[3]}'${range[4]}"`,
    };
  }
  const ft = t.match(/(\d+)\s*'\s*(\d+)/);
  if (ft) {
    const inches = Number(ft[1]) * 12 + Number(ft[2]);
    return { inches, display: `${ft[1]}'${ft[2]}"` };
  }
  return { inches: 0, display: t.slice(0, 12) || "?" };
}

export type ParsedSheet = {
  fileId: string;
  name: string;
  heightRaw: string;
  inches: number;
  display: string;
  hair: string;
  eyes: string;
  skin: string;
  wings: string;
  markings: string;
  build: string;
  outfitName: string;
  outfit: string;
  scaleLock: string;
  basePrompt: string;
};

function unwrap(data: Record<string, unknown>): Record<string, unknown> {
  const sheet = data.characterSheet as { content?: Record<string, unknown> } | undefined;
  if (sheet?.content) return sheet.content;
  if (data.content && typeof data.content === "object") {
    return data.content as Record<string, unknown>;
  }
  return data;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
}

export function parseSheet(fileId: string, data: Record<string, unknown>): ParsedSheet {
  const c = unwrap(data);
  const pf = (c.physicalForm as Record<string, unknown>) || {};
  const out = (c.signatureOutfit as Record<string, unknown>) || {};
  const name = str(c.characterName) || str(data.characterName) || fileId;
  const heightRaw = str(pf.height);
  const h = parseHeight(heightRaw);
  const hair = clip(str(pf.hair), 100);
  const eyes = clip(str(pf.eyes), 80);
  const skin = clip(str(pf.skin), 80);
  const wingsRaw = str(pf.wings);
  const wings = !wingsRaw || /^none$/i.test(wingsRaw) ? "" : clip(wingsRaw, 90);
  const markings = clip(str(pf.uniqueMarkings), 80);
  const build = clip(str(pf.build), 80);
  const outfitName = str(out.outfitName);
  const outfitBits = [
    outfitName,
    str(out.primaryMaterials),
    str(out.secondaryMaterials),
  ].filter(Boolean);
  const outfit = clip(sanitize(outfitBits.join(", ")), 160);

  const lockParts = [
    h.display !== "?" ? `${h.display} tall` : "",
    hair,
    eyes,
    skin,
    wings,
    outfit,
  ].filter(Boolean);

  const scaleLock = sanitize(lockParts.join(", "));
  const extra = [markings, build].filter(Boolean).join(", ");
  const basePrompt = sanitize(
    [name, scaleLock, extra, "full body, floor visible, photorealistic"].filter(Boolean).join(", "),
  );

  return {
    fileId,
    name,
    heightRaw,
    inches: h.inches,
    display: h.display,
    hair,
    eyes,
    skin,
    wings,
    markings,
    build,
    outfitName,
    outfit,
    scaleLock,
    basePrompt,
  };
}

const modules = import.meta.glob("../data/sheets/*.json", {
  eager: true,
  import: "default",
}) as Record<string, Record<string, unknown>>;

export const SHEETS: Record<string, ParsedSheet> = {};
for (const [path, data] of Object.entries(modules)) {
  const fileId = path.split("/").pop()!.replace(/\.json$/, "");
  SHEETS[fileId] = parseSheet(fileId, data);
}

export function sheet(id: string): ParsedSheet | undefined {
  return SHEETS[id];
}
