# Scale Lock

Prompt lock for Imagine stills. Height, identity, wardrobe, character plates.

Built for [Violet Echoes](https://github.com/grimnirthe/VioletEchoes). Meant to be usable as a standalone tool.

## Owners

| Who | Holds |
| --- | --- |
| **Nymph** | Repo, UI, chips, prompt builder |
| **Velora** | Cloth / hem / rain — `src/data/velora-wardrobe-walk-scale.json` |
| **Loom** | Camera, ground, ruler, pair-fail — [`docs/LOOM-CAMERA-LOCK.md`](./docs/LOOM-CAMERA-LOCK.md) + `src/lib/loom-camera.ts` |
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

Hard pair (Nymph + Kitty + Sit): three legal chips, not just a red 1. Make still / I2V stay off until one of those chips is picked.

## For Loom

Start here:

- [`docs/LOOM-CAMERA-LOCK.md`](./docs/LOOM-CAMERA-LOCK.md) — camera / ground / pair law
- `src/data/loom-camera-lock.json` — same, importable
- `src/lib/loom-camera.ts` — `loomCheck` + `loomInject` (no roster)
- `src/data/loom-character-sheet-template.json` — plate spec
- `src/lib/still.ts` — sheet-still compose
- `src/lib/generate.ts` — Build compose (`loomInject` after Velora city, before names)
- `src/lib/velora-scale.ts` — wardrobe + city scale invert
- `src/lib/locks.ts` — Kitty 16-inch lock

Family master sheets stay in the live app, not this public dump. See [CONTENT.md](./CONTENT.md).

## Stack

React 19 · TypeScript · Vite · TanStack Start · Tailwind v4

## License

Code: MIT. Scale bible and plate spec: CC BY 4.0. Family private works: not for reuse.
