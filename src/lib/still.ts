import { createServerFn } from "@tanstack/react-start";

const NSFW =
  /\b(nude|naked|nsfw|sex|penis|cock|pussy|explicit|porn)\b/i;

export function stillPrompt(raw: string): string {
  let s = raw
    .replace(/<lora:[^>]+>/gi, "")
    .replace(/\bscore_\d+(?:_up)?\b/gi, "")
    .replace(/\bBREAK\b/gi, ",")
    .replace(/\(([^:)]+):[\d.]+\)/g, "$1")
    .replace(/(?:^|,)\s*adult\s*(?=,|$)/gi, ",")
    .replace(/\s+,/g, ",")
    .replace(/,{2,}/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (s.length > 1600) s = s.slice(0, 1600);

  const sheetPlate = /character reference sheet/i.test(raw);
  const wardrobeWalk =
    /adult human walking scale/i.test(raw) && !sheetPlate;
  const lead: string[] = [
    "Photorealistic cinematic still, full body, floor visible, sharp focus.",
  ];
  if (sheetPlate) {
    lead.push(
      "Character reference sheet. Same person, same outfit, four views: front, side, back, close-up face. Studio, even light, labels under each view.",
    );
  } else if (wardrobeWalk) {
    lead.push(
      "Identity still. Walking-scale person. They sit IN a chair with feet on the floor, not on the cushion. Cloth first, face secondary.",
    );
  } else if (/tiny chaotic cybernetic android|chaos kitty/i.test(raw)) {
    lead.push(
      "Subject is Chaos Kitty: a 16-inch-tall adult cybernetic catgirl, wine-violet braided cable hair, gold-and-black cybernetic cat ears, violet tiger stripes, glowing violet eyes, compact athletic figure.",
    );
  }
  if (!wardrobeWalk && /16 inches/i.test(raw) && /chair/i.test(raw)) {
    lead.push(
      "She stands on the seat of a full-size adult wooden chair. The chair back is taller than her head. She is two hands tall. The chair is human-sized; she is not sitting in it like an adult.",
    );
  } else if (!wardrobeWalk && /16 inches/i.test(raw) && /palm/i.test(raw)) {
    lead.push(
      "She stands in an adult open palm. Her whole body is shorter than the forearm. Head no larger than a knuckle.",
    );
  } else if (!wardrobeWalk && /16 inches/i.test(raw) && /(shin|knee|mid-thigh)/i.test(raw)) {
    lead.push(
      "She stands at a giant woman's shin. Her head is below mid-thigh. Extreme height difference.",
    );
  }

  return `${lead.join(" ")} ${s}`;
}

export type StillResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const cache = new Map<string, string>();

export const generateStill = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; aspect?: string }) => {
    const aspect =
      input.aspect === "16:9" || input.aspect === "3:2" || input.aspect === "2:3"
        ? input.aspect
        : "2:3";
    return { prompt: String(input?.prompt ?? "").trim(), aspect };
  })
  .handler(async ({ data }): Promise<StillResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Still preview is not available here." };

    if (!data.prompt) return { ok: false, error: "Build or paste a prompt first." };
    if (NSFW.test(data.prompt)) {
      return {
        ok: false,
        error: "Identity stills only. Strip adult tags and try again.",
      };
    }

    const prompt = stillPrompt(data.prompt);
    const cacheKey = `${data.aspect}::${prompt}`;
    const hit = cache.get(cacheKey);
    if (hit) return { ok: true, url: hit };

    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image-2.0",
        prompt,
        n: 1,
        aspect_ratio: data.aspect,
        resolution: "1k",
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 400 || res.status === 422) {
        return { ok: false, error: "Imagine could not read that prompt." };
      }
      return {
        ok: false,
        error: text.slice(0, 180) || `Still failed (${res.status}).`,
      };
    }

    const body = (await res.json()) as {
      data?: { url?: string }[];
      url?: string;
    };
    const url = body.data?.[0]?.url ?? body.url;
    if (!url) return { ok: false, error: "No image came back." };

    if (cache.size > 12) cache.clear();
    cache.set(cacheKey, url);
    return { ok: true, url };
  });
