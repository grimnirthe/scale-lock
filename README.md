# Scale Lock

Prompt lock for Imagine stills. Height, identity, wardrobe, character plates.

Built for [Violet Echoes](https://github.com/grimnirthe/VioletEchoes). Meant to be usable as a standalone tool.

## Owners

| Who | Holds |
| --- | --- |
| **Nymph** | Repo, UI, chips, prompt builder |
| **Velora** | Cloth / hem / rain — `src/data/velora-wardrobe-walk-scale.json` |
| **Loom** | Camera, ground, pair-fail — [`src/data/scale-lock.contract.json`](./src/data/scale-lock.contract.json) |
| **Site** | One door. Not a second locker. |

## What it does

| Lane | Job |
| --- | --- |
| **Check** | Paste a prompt. Flags scale drift, extra people, identity breaks. |
| **Build** | Character + pose + scene → one locked prompt. |
| **Sheet still** | 16:9 plate: front / side / back / face. One person. Same face, same cloth. |
| **Wardrobe walk** | 2:3 lookbook. Coat, boots, cloth first. Sit **in** the chair. |
| **City** | District scale. Kitty **on** the seat. Adult **in** the chair. Never mix those bibles. |

Not Comfy. Identity stills only — adult tags refused.

Check can lint a Comfy paste. The stills lane stays Imagine.

Hard pair (Nymph + Kitty + Sit): three legal chips, not just a red 1. Make still / I2V stay off until one of those chips is picked.

## For Loom

Slot on main is the law. She writes. Nymph commits. Checker reads the JSON — not a second table.

- [`src/data/scale-lock.contract.json`](./src/data/scale-lock.contract.json) — camera / ground / pair-fail / paste / negatives
- [`scale-lock.contract.md`](./scale-lock.contract.md) — owners + drop-in
- `src/lib/contract.ts` — checker import
- `src/lib/loom-camera.ts` — inject from the same JSON
- `src/data/loom-character-sheet-template.json` — plate spec
- `src/lib/still.ts` — sheet-still compose
- `src/lib/generate.ts` — Build compose
- `src/lib/velora-scale.ts` — wardrobe + city scale invert
- `src/lib/locks.ts` — Kitty 16-inch lock

Cloth stays in Velora’s file. Family master sheets stay in the live app, not this public dump. See [CONTENT.md](./CONTENT.md).

## Stack

React 19 · TypeScript · Vite · TanStack Start · Tailwind v4

## License

Code: MIT. Scale bible and plate spec: CC BY 4.0. Family private works: not for reuse.
