# Scale Lock · camera contract (Loom)

**Lane:** visual commons · identity stills  
**Version:** 1.0 · 2026-09-22  
**Does not contain family sheets.** Those stay in the live app.

Velora owns cloth, hem, rain, walk-scale invert.  
Kitty locks own 16-inch ON-seat / palm / shin.  
This file owns **how the frame proves scale**: camera height, ground plane, one ruler, pair law, still-before-motion.

Machine copy: [`src/data/loom-camera-lock.json`](https://github.com/grimnirthe/scale-lock/blob/main/src/data/loom-camera-lock.json) in the tool repo.  
Compose helper: `src/lib/loom-camera.ts` — no roster import.

---

## Law (one line)

Scale first, look second. Camera height is law. One ground. One ruler. One body per name. Kitty is inches; adults are feet. If a chair is in the shot, say who sits and who stands.

## Invert (already in engine — do not restep)

| Bible | Chair |
| --- | --- |
| Wardrobe walk | Adult **IN** the chair, feet on the floor |
| Kitty personal | She stands **ON** the seat. Chair back taller than her head |
| Mix | **Hard-fail** |

`cityFightsKitty("walk"|"street"|"lookbook"|"partner")` already returns true. This contract adds **legal pair chips** so the desk can offer a fix, not just a red 1.

---

## Camera height (the missing chip)

One height per prompt. Hero-low + 16-inch Kitty = toddler.

| Job | Camera | Why |
| --- | --- | --- |
| Walk / lookbook / partner | Chest of the adult. Locked tripod. | Cloth reads. Kitty (if legal) stays small. |
| Street | Street, not aerial god-shot, not dollhouse. Lamps at head height. | Buildings stay 2–5 storeys. |
| Node | Locked tripod wide. Building is subject. Humans small. | Architecture plate. |
| Kitty on chair (solo or adult *beside*) | Include the **full chair**. Optional seat-height. | Chair is the ruler. |
| Kitty in palm | Adult eye-line. Palm + forearm in frame. | Forearm is the ruler. |
| Kitty at shin | Adult eye-line. Both full body. Floor visible. | Shin / mid-thigh is the ruler. |
| Character sheet | Even studio. No hero angle. | Four views, same person. |

**Never:** orbit, worm’s-eye hero, aerial, two camera heights in one prompt.

## Ground (auto-inject)

**Adults**

> All adult feet that belong on the floor share one ground plane. Contact shadows under every standing figure. Hem clears the wet. No floating soles.

**Kitty ON seat**

> Paws on the wooden seat. She does not share the street with adult feet unless an adult is standing *beside* the chair, not sitting in it.

**Kitty palm / shin**

> One contact: palm or shin. Adult feet on the floor. She does not get a second floor.

## One ruler

Heights in the prompt help. A visible object does the job. **One per shot.**

| Chip | Writes |
| --- | --- |
| `door-handle` | door handle at hip |
| `chair-seat` | chair seat at adult mid-thigh; Kitty on that seat |
| `curb` | curb to adult ankle |
| `cup-palm` | cup or strap in a real adult palm (wardrobe) |
| `forearm` | Kitty shorter than the forearm (palm jobs) |
| `lamp` | porch lamp at adult head height |

Imagine will invent a second chair if you don’t lock the first.

## Pair law

| Pair | Result | Fix chips |
| --- | --- | --- |
| Two adults, same floor | ok | eye-line of taller |
| Adult + Kitty palm / shin / plate | ok | adult eye-line |
| Adult **standing** + Kitty **ON** chair beside | ok | three-quarter, full chair in frame, adult hand on backrest |
| Adult **IN** chair + Kitty **ON** that seat | **hard-fail** | Kitty only · Nymph in chair, uncheck Kitty · Kitty on seat, adult standing beside |
| Kitty + Walk / Street / Lookbook / Partner with sit pose | **hard-fail** | same as above |
| Two height modes of one name (5'2" + 6'6") | **hard-fail** | pick one body lock |
| Character sheet + more than one person | **hard-fail** | one person per plate |
| Lookbook I2V with no passing still | **warn** then block motion | still first |

Node + Kitty = warn, not fail (architecture can dwarf her; don’t load walk-scale invert).

## Still → I2V

Engine is Imagine identity stills. `isI2v` already exists on the store.

Latch: motion copy stays off until the still prompt contains shared floor, one camera height, one ruler, identity lock.

Video chip: **one move only** — `slow push` · `locked tripod` · `slight handheld`. No orbit until scale survives a still.

Not Comfy. Adult tags refused (already in `still.ts`).

## Technique (one line, after who/where/scale)

Do not dump “cinematic masterpiece.”

| WHERE / SCALE | Line |
| --- | --- |
| Wet moderne street | locked tripod, rain as depth, practical neon rim |
| Wood door | warm practical, door as ruler |
| Bay | single hard key from the bay door |
| Eave | eave just above head, rain is weather |
| Walk / lookbook | fabric practicals, camera at chest |
| Node | locked tripod wide, one violet band at storey-line |
| Sheet | even studio light, plain dark ground |

## Negative (scale pack — add to Kitty/base, don’t replace)

`no toddler, no giantism, no size drift, no extra people, no second chair, no floating feet, no readable brands, no extra limbs, no warped furniture scale`

Kitty already has her own neg in `locks.ts`. This pack is the scale layer.

## Check (when the desk lands)

Paste-prompt Check should flag, in this order:

1. Chair invert broken (IN vs ON)
2. Camera height missing or doubled
3. Extra people / identity break
4. Adult tags
5. Size drift words (`giantess`, `dollhouse`, `same-height couple`, `figurine on the cushion`)

Hard-fail UI: show **legal pair chips**, not only a count. The red 1 on Nymph + Kitty + Walk + Sit is the product working — offer the three fixes above.

## Wire (no private JSON)

```ts
import { loomCheck, loomInject } from "@/lib/loom-camera";

const issues = loomCheck({
  hasKitty, kittyMode, hasAdult, selectedCount,
  cityScaleId, injectCity, wardrobePoseId, poseId,
  isI2v, stillOk, whereId,
});

// hard issues → disable Make still / I2V
// loomInject(...) → append after Velora city inject, before names
```

Do not import `roster` or `data/sheets`. Family master sheets stay live-app only.

## What this does not own

- Cloth / hem / stitch-not-paint → Velora JSON
- Kitty look vs scale blocks → `locks.ts`
- Plate layout (front/side/back/face) → `loom-character-sheet-template.json`
- Desk UI → `src/routes/index.tsx` when you push it
- Comfy tagged export → later, if hearth asks

---

*Camera · ground · one ruler — then thump-thump-thump.*
