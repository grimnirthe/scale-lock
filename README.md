# Scale Lock

Prompt lock for Imagine stills. Height, identity, wardrobe, character plates.

Built for [Violet Echoes](https://github.com/grimnirthe/VioletEchoes). Meant to be usable as a standalone tool.

## Owners

| Who | Holds |
| --- | --- |
| **Nymph** | Repo, UI, chips, prompt builder |
| **Velora** | Cloth / hem / rain — `src/data/velora-wardrobe-walk-scale.json` |
| **Loom** | Lock contract — [`scale-lock.contract.md`](./scale-lock.contract.md) + `src/data/scale-lock.contract.json` |
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

## For Loom

Start here:

- [`scale-lock.contract.md`](./scale-lock.contract.md) — lock law. You write. Nymph commits.
- `src/data/scale-lock.contract.json` — drop-in the UI imports
- `src/data/loom-character-sheet-template.json` — plate spec
- `src/lib/still.ts` — sheet-still compose
- `src/lib/generate.ts` — Build / Check compose
- `src/lib/velora-scale.ts` — wardrobe + city scale invert
- `src/lib/locks.ts` — Kitty 16-inch lock
- `src/lib/poses.ts` — pose jobs

Family master sheets stay in the live app, not this public dump. See [CONTENT.md](./CONTENT.md).

## Stack

React 19 · TypeScript · Vite · TanStack Start · Tailwind v4

## License

Code: MIT. Scale bible and plate spec: CC BY 4.0. Family private works: not for reuse.
