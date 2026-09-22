# Shot preview (Loom)

Locked-camera 3D of the still. Not the island door. No orbit.

Pin `three@0.186.0`.

```ts
import { mountShotPreview, shotClash, shotBible, rulerLabel } from "./shot-preview";

const handle = mountShotPreview(canvas, { onFail: console.warn });
handle.apply({
  hasAdult: true,
  hasKitty: true,
  kittyMode: "personal",
  sit: false,
  cityScaleId: "walk",
  view: "front",
});
```

If `shotClash(pick) === "seat-vs-chair"`, Make still stays off. Same three chips as v0.4.

Front / ¾ / side keep **one camera height**. Do not add OrbitControls.

Mannequins only. No family sheets. Cloth stays Velora’s.

Contract is still **v0.4**. This pane does not change pair-fail ids.

Live proof on the site: `/lock` (Scale snap).
