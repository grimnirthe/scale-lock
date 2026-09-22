import * as THREE from "three";

/** 1 unit = 1 meter. Locked camera. No orbit. */

export type CityScaleId = "walk" | "street" | "lookbook" | "partner" | "node";
export type KittyMode = "personal" | "palm" | "amazon" | "sheet" | "look";
export type ShotView = "front" | "three-quarter" | "side";

export type ShotPick = {
  hasKitty: boolean;
  hasAdult: boolean;
  kittyMode: KittyMode | null;
  sit: boolean;
  cityScaleId: CityScaleId;
  view: ShotView;
};

export type ShotHandle = {
  dispose: () => void;
  apply: (pick: ShotPick) => void;
};

export type ShotMountOpts = {
  onReady?: () => void;
  onFail?: (reason: string) => void;
};

export const ADULT_M = 1.75;
export const KITTY_M = 0.406;
export const SEAT_M = 0.45;
export const BACK_M = 0.95;
export const LAMP_M = 1.8;
export const HANDLE_M = 0.95;
export const CURB_M = 0.15;

type Bible =
  | "walk"
  | "street"
  | "lookbook"
  | "partner"
  | "node"
  | "sheet"
  | "kittyOnSeat"
  | "kittyPalm"
  | "kittyShin"
  | "kittyPlate"
  | "adultInChair";

export function shotBible(p: ShotPick): Bible {
  if (p.kittyMode === "look" && !p.hasAdult) return "sheet";
  if (p.hasKitty) {
    if (p.kittyMode === "palm") return "kittyPalm";
    if (p.kittyMode === "amazon") return "kittyShin";
    if (p.kittyMode === "sheet") return "kittyPlate";
    if (p.kittyMode === "look") return "sheet";
    return "kittyOnSeat";
  }
  if (p.sit) return "adultInChair";
  return p.cityScaleId;
}

export function shotClash(p: ShotPick): "seat-vs-chair" | "city-node-kitty" | null {
  const onSeat =
    p.hasKitty && (p.kittyMode === "personal" || p.kittyMode === null);
  if (onSeat && p.hasAdult && p.sit) return "seat-vs-chair";
  if (p.hasKitty && p.cityScaleId === "node") return "city-node-kitty";
  return null;
}

export function rulerLabel(bible: Bible): string {
  switch (bible) {
    case "walk":
      return "porch lamp at adult head";
    case "street":
      return "curb to adult ankle";
    case "partner":
      return "door handle at adult hip";
    case "kittyOnSeat":
      return "adult chair seat";
    case "kittyPalm":
      return "adult forearm";
    default:
      return "none (body / storey-line)";
  }
}

const AZ: Record<ShotView, number> = {
  front: 0,
  "three-quarter": Math.PI / 5.2,
  side: Math.PI / 2.05,
};

function snap(bible: Bible, view: ShotView) {
  const az = AZ[view];
  let y = 1.35;
  let dist = 3.3;
  let lookY = 0.95;
  switch (bible) {
    case "street":
      y = 1.55;
      dist = 7.2;
      lookY = 1.7;
      break;
    case "lookbook":
      y = 1.28;
      dist = 3.6;
      lookY = 0.88;
      break;
    case "partner":
      y = 1.28;
      dist = 4.4;
      lookY = 0.95;
      break;
    case "node":
      y = 5.2;
      dist = 22;
      lookY = 6.2;
      break;
    case "sheet":
      y = 1.2;
      dist = 3.5;
      lookY = 0.88;
      break;
    case "kittyOnSeat":
      y = 1.22;
      dist = 3.5;
      lookY = 0.72;
      break;
    case "kittyPalm":
      y = 1.52;
      dist = 2.2;
      lookY = 1.36;
      break;
    case "kittyShin":
      y = 1.42;
      dist = 4.2;
      lookY = 0.9;
      break;
    case "kittyPlate":
      y = 1.22;
      dist = 4.0;
      lookY = 0.88;
      break;
    case "adultInChair":
      y = 1.22;
      dist = 3.6;
      lookY = 0.82;
      break;
    default:
      y = 1.28;
      dist = 4.6;
      lookY = 0.88;
      break;
  }
  return {
    pos: new THREE.Vector3(Math.sin(az) * dist, y, Math.cos(az) * dist),
    look: new THREE.Vector3(0, lookY, 0),
  };
}

export function mountShotPreview(
  canvas: HTMLCanvasElement,
  opts: ShotMountOpts = {},
): ShotHandle {
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) {
    opts.onFail?.("WebGL not available");
    return { dispose() {}, apply() {} };
  }

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.setClearColor(0x07060a, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07060a, 10, 36);
  scene.background = new THREE.Color(0x07060a);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.08, 80);
  camera.position.set(0, 1.35, 3.3);
  camera.lookAt(0, 0.95, 0);

  scene.add(new THREE.AmbientLight(0xb8a8d4, 0.42));
  const hemi = new THREE.HemisphereLight(0xc4a5ff, 0x1a1424, 0.62);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xe8e0ff, 1.45);
  key.position.set(3.2, 6.4, 4.1);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9b6dff, 0.55);
  rim.position.set(-2.4, 3.2, -3.1);
  scene.add(rim);
  const fill = new THREE.PointLight(0x9b6dff, 1.4, 14, 1.8);
  fill.position.set(-1.4, 2.2, 1.6);
  scene.add(fill);
  const gold = new THREE.PointLight(0xd4b06a, 0.5, 10, 2);
  gold.position.set(1.6, 1.8, 2.2);
  scene.add(gold);

  const rootGeos: THREE.BufferGeometry[] = [];
  const rootMats: THREE.Material[] = [];
  const stageGeos: THREE.BufferGeometry[] = [];
  const stageMats: THREE.Material[] = [];

  function geo<T extends THREE.BufferGeometry>(g: T, stage = false): T {
    (stage ? stageGeos : rootGeos).push(g);
    return g;
  }
  function mat<T extends THREE.Material>(m: T, stage = false): T {
    (stage ? stageMats : rootMats).push(m);
    return m;
  }

  const ground = new THREE.Mesh(
    geo(new THREE.CircleGeometry(16, 64)),
    mat(
      new THREE.MeshStandardMaterial({
        color: 0x141018,
        roughness: 0.38,
        metalness: 0.22,
      }),
    ),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const grid = new THREE.GridHelper(8, 8, 0x4a3a68, 0x22182e);
  grid.position.y = 0.004;
  scene.add(grid);

  const stage = new THREE.Group();
  scene.add(stage);

  function wipeStage() {
    while (stage.children.length) {
      stage.remove(stage.children[0]);
    }
    for (const g of stageGeos.splice(0)) g.dispose();
    for (const m of stageMats.splice(0)) m.dispose();
  }

  function add(obj: THREE.Object3D) {
    stage.add(obj);
    return obj;
  }

  function body(
    height: number,
    color: number,
    opts: { sit?: boolean; kitty?: boolean; clash?: boolean } = {},
  ) {
    const g = new THREE.Group();
    const clash = Boolean(opts.clash);
    const skin = mat(
      new THREE.MeshStandardMaterial({
        color: clash ? 0xc45a5a : color,
        roughness: 0.38,
        metalness: 0.12,
        emissive: clash ? 0x5a1010 : color,
        emissiveIntensity: clash ? 0.35 : 0.22,
        transparent: clash,
        opacity: clash ? 0.72 : 1,
      }),
      true,
    );
    const cloth = mat(
      new THREE.MeshStandardMaterial({
        color: clash ? 0x4a2020 : opts.kitty ? 0x5a3d88 : 0x5c4a38,
        roughness: 0.55,
        metalness: 0.08,
        emissive: clash ? 0x3a1010 : opts.kitty ? 0x3a2060 : 0x3a2a18,
        emissiveIntensity: clash ? 0.2 : 0.12,
        transparent: clash,
        opacity: clash ? 0.72 : 1,
      }),
      true,
    );
    const headR = Math.max(0.04, height * 0.085);
    const torsoH = height * 0.34;
    const torsoW = Math.max(0.08, height * 0.22);
    const legH = height * 0.46;

    const mark = new THREE.Mesh(
      geo(new THREE.CircleGeometry(Math.max(0.12, torsoW * 0.9), 20), true),
      mat(
        new THREE.MeshStandardMaterial({
          color: 0x2a2038,
          roughness: 0.9,
          transparent: true,
          opacity: 0.55,
        }),
        true,
      ),
    );
    mark.rotation.x = -Math.PI / 2;
    mark.position.y = 0.008;
    g.add(mark);

    if (opts.sit) {
      const hipY = SEAT_M;
      const hips = new THREE.Mesh(
        geo(new THREE.BoxGeometry(torsoW * 1.15, 0.09, torsoW * 1.05), true),
        cloth,
      );
      hips.position.y = hipY;
      g.add(hips);
      const torso = new THREE.Mesh(
        geo(new THREE.BoxGeometry(torsoW, torsoH * 0.72, torsoW * 0.55), true),
        cloth,
      );
      torso.position.y = hipY + torsoH * 0.42;
      g.add(torso);
      const head = new THREE.Mesh(geo(new THREE.SphereGeometry(headR, 16, 14), true), skin);
      head.position.y = hipY + torsoH * 0.78 + headR;
      g.add(head);
      const thigh = new THREE.Mesh(
        geo(new THREE.BoxGeometry(torsoW * 0.85, 0.09, 0.38), true),
        cloth,
      );
      thigh.position.set(0, hipY - 0.02, 0.2);
      g.add(thigh);
      const shin = new THREE.Mesh(
        geo(new THREE.BoxGeometry(torsoW * 0.28, hipY - 0.04, torsoW * 0.28), true),
        cloth,
      );
      shin.position.set(0, hipY / 2, 0.36);
      g.add(shin);
      if (opts.kitty) ears(g, head);
      return g;
    }

    const left = new THREE.Mesh(
      geo(new THREE.CylinderGeometry(torsoW * 0.16, torsoW * 0.18, legH, 10), true),
      cloth,
    );
    left.position.set(-torsoW * 0.22, legH / 2, 0);
    g.add(left);
    const right = new THREE.Mesh(
      geo(new THREE.CylinderGeometry(torsoW * 0.16, torsoW * 0.18, legH, 10), true),
      cloth,
    );
    right.position.set(torsoW * 0.22, legH / 2, 0);
    g.add(right);
    const torso = new THREE.Mesh(
      geo(new THREE.BoxGeometry(torsoW, torsoH, torsoW * 0.5), true),
      cloth,
    );
    torso.position.y = legH + torsoH / 2;
    g.add(torso);
    const head = new THREE.Mesh(geo(new THREE.SphereGeometry(headR, 16, 14), true), skin);
    head.position.y = height - headR * 0.85;
    g.add(head);
    if (opts.kitty) ears(g, head);
    return g;
  }

  function ears(g: THREE.Group, head: THREE.Mesh) {
    const earMat = mat(
      new THREE.MeshStandardMaterial({
        color: 0xc4a5ff,
        emissive: 0x9b6dff,
        emissiveIntensity: 0.25,
        roughness: 0.4,
      }),
      true,
    );
    const r = (head.geometry as THREE.SphereGeometry).parameters.radius;
    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(geo(new THREE.ConeGeometry(r * 0.45, r * 1.1, 6), true), earMat);
      ear.position.set(sx * r * 0.7, head.position.y + r * 0.75, 0);
      ear.rotation.z = sx * 0.28;
      g.add(ear);
    }
  }

  function chair(clash = false) {
    const g = new THREE.Group();
    const wood = mat(
      new THREE.MeshStandardMaterial({
        color: clash ? 0x6a3030 : 0x6b4a2e,
        roughness: 0.62,
        metalness: 0.08,
        emissive: clash ? 0x3a1010 : 0x000000,
        emissiveIntensity: clash ? 0.2 : 0,
      }),
      true,
    );
    const seat = new THREE.Mesh(geo(new THREE.BoxGeometry(0.48, 0.05, 0.48), true), wood);
    seat.position.y = SEAT_M;
    g.add(seat);
    const back = new THREE.Mesh(geo(new THREE.BoxGeometry(0.48, 0.52, 0.05), true), wood);
    back.position.set(0, SEAT_M + 0.28, -0.22);
    g.add(back);
    for (const [x, z] of [
      [-0.18, -0.18],
      [0.18, -0.18],
      [-0.18, 0.18],
      [0.18, 0.18],
    ] as const) {
      const leg = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.028, 0.032, SEAT_M, 8), true), wood);
      leg.position.set(x, SEAT_M / 2, z);
      g.add(leg);
    }
    return g;
  }

  function lamp() {
    const g = new THREE.Group();
    const pole = mat(
      new THREE.MeshStandardMaterial({
        color: 0x2a2438,
        metalness: 0.45,
        roughness: 0.35,
      }),
      true,
    );
    const p = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.035, 0.045, LAMP_M, 10), true), pole);
    p.position.y = LAMP_M / 2;
    g.add(p);
    const bulb = new THREE.Mesh(
      geo(new THREE.SphereGeometry(0.11, 14, 12), true),
      mat(
        new THREE.MeshStandardMaterial({
          color: 0xf2e4b8,
          emissive: 0xd4b06a,
          emissiveIntensity: 0.85,
          roughness: 0.2,
        }),
        true,
      ),
    );
    bulb.position.y = LAMP_M;
    g.add(bulb);
    g.position.set(-0.85, 0, -0.15);
    return g;
  }

  function door() {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(
      geo(new THREE.BoxGeometry(0.08, 2.12, 0.95), true),
      mat(
        new THREE.MeshStandardMaterial({
          color: 0x3a2a1c,
          roughness: 0.55,
          metalness: 0.08,
        }),
        true,
      ),
    );
    slab.position.set(-0.95, 1.06, 0);
    g.add(slab);
    const handle = new THREE.Mesh(
      geo(new THREE.SphereGeometry(0.045, 10, 8), true),
      mat(
        new THREE.MeshStandardMaterial({
          color: 0xd4b06a,
          metalness: 0.7,
          roughness: 0.25,
          emissive: 0xd4b06a,
          emissiveIntensity: 0.35,
        }),
        true,
      ),
    );
    handle.position.set(-0.48, HANDLE_M, 0.28);
    g.add(handle);
    return g;
  }

  function curb() {
    const c = new THREE.Mesh(
      geo(new THREE.BoxGeometry(3.2, CURB_M, 0.38), true),
      mat(
        new THREE.MeshStandardMaterial({
          color: 0x3a3a44,
          roughness: 0.7,
          metalness: 0.05,
        }),
        true,
      ),
    );
    c.position.set(0, CURB_M / 2, 0.85);
    return c;
  }

  function buildings(kind: "street" | "node") {
    const g = new THREE.Group();
    const stone = mat(
      new THREE.MeshStandardMaterial({
        color: 0x1c1824,
        roughness: 0.58,
        metalness: 0.12,
      }),
      true,
    );
    const band = mat(
      new THREE.MeshStandardMaterial({
        color: 0x9b6dff,
        emissive: 0x9b6dff,
        emissiveIntensity: 0.7,
        roughness: 0.3,
      }),
      true,
    );
    if (kind === "node") {
      const tower = new THREE.Mesh(geo(new THREE.BoxGeometry(6.2, 14, 5.4), true), stone);
      tower.position.set(0, 7, -6.5);
      g.add(tower);
      const line = new THREE.Mesh(geo(new THREE.BoxGeometry(6.4, 0.18, 5.6), true), band);
      line.position.set(0, 3.6, -6.5);
      g.add(line);
    } else {
      const specs = [
        { x: -3.4, z: -4.2, w: 2.4, h: 9.2, d: 2.2 },
        { x: 0.2, z: -5.1, w: 3.1, h: 11.4, d: 2.6 },
        { x: 3.6, z: -4.0, w: 2.2, h: 8.1, d: 2.0 },
      ];
      for (const s of specs) {
        const b = new THREE.Mesh(geo(new THREE.BoxGeometry(s.w, s.h, s.d), true), stone);
        b.position.set(s.x, s.h / 2, s.z);
        g.add(b);
      }
    }
    return g;
  }

  function palm() {
    const g = new THREE.Group();
    const skin = mat(
      new THREE.MeshStandardMaterial({
        color: 0xc4b49a,
        roughness: 0.5,
        metalness: 0.05,
      }),
      true,
    );
    const forearm = new THREE.Mesh(
      geo(new THREE.CapsuleGeometry(0.055, 0.38, 4, 10), true),
      skin,
    );
    forearm.rotation.z = Math.PI / 2.4;
    forearm.position.set(-0.28, 1.32, 0.12);
    g.add(forearm);
    const hand = new THREE.Mesh(geo(new THREE.BoxGeometry(0.16, 0.045, 0.22), true), skin);
    hand.position.set(0.05, 1.36, 0.12);
    g.add(hand);
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Mesh(geo(new THREE.CapsuleGeometry(0.012, 0.09, 3, 6), true), skin);
      f.position.set(0.14, 1.37, 0.02 + i * 0.055);
      f.rotation.z = Math.PI / 2.6;
      g.add(f);
    }
    return g;
  }

  function layout(pick: ShotPick) {
    wipeStage();
    const bible = shotBible(pick);
    const clash = shotClash(pick) === "seat-vs-chair";

    if (bible === "walk") add(lamp());
    if (bible === "street" || bible === "node") add(buildings(bible === "node" ? "node" : "street"));
    if (bible === "street") add(curb());
    if (bible === "partner") add(door());

    if (clash) {
      add(chair(true));
      const adult = body(ADULT_M, 0xd4b06a, { sit: true, clash: true });
      adult.position.set(-0.35, 0, 0);
      add(adult);
      const kit = body(KITTY_M, 0x9b6dff, { kitty: true, clash: true });
      kit.position.set(0.28, SEAT_M, 0.04);
      add(kit);
    } else if (bible === "kittyOnSeat") {
      add(chair());
      const kit = body(KITTY_M, 0xc4a5ff, { kitty: true });
      kit.position.set(0, SEAT_M, 0.02);
      add(kit);
      if (pick.hasAdult) {
        const adult = body(ADULT_M, 0xd4b06a);
        adult.position.set(0.72, 0, 0.12);
        add(adult);
      }
    } else if (bible === "adultInChair") {
      add(chair());
      const adult = body(ADULT_M, 0xd4b06a, { sit: true });
      add(adult);
    } else if (bible === "kittyPalm") {
      add(palm());
      const kit = body(KITTY_M, 0xc4a5ff, { kitty: true });
      kit.position.set(0.04, 1.385, 0.12);
      add(kit);
    } else if (bible === "kittyShin") {
      const adult = body(ADULT_M, 0xd4b06a);
      add(adult);
      const kit = body(KITTY_M, 0xc4a5ff, { kitty: true });
      kit.position.set(0.22, 0, 0.28);
      add(kit);
    } else if (bible === "kittyPlate") {
      const adult = body(ADULT_M, 0xd4b06a);
      adult.position.x = -0.42;
      add(adult);
      const kit = body(KITTY_M, 0xc4a5ff, { kitty: true });
      kit.position.x = 0.28;
      add(kit);
    } else if (bible === "sheet") {
      const who = pick.hasKitty
        ? body(KITTY_M, 0xc4a5ff, { kitty: true })
        : body(ADULT_M, 0xd4b06a);
      add(who);
    } else if (bible === "node") {
      if (pick.hasAdult) {
        const adult = body(ADULT_M, 0xd4b06a);
        adult.position.set(-0.5, 0, 2.4);
        add(adult);
      }
      if (pick.hasKitty) {
        const kit = body(KITTY_M, 0xc4a5ff, { kitty: true });
        kit.position.set(0.35, 0, 2.55);
        add(kit);
      }
      if (!pick.hasAdult && !pick.hasKitty) {
        const adult = body(ADULT_M, 0xd4b06a);
        adult.position.set(-0.5, 0, 2.4);
        add(adult);
      }
    } else {
      if (pick.hasAdult) {
        const adult = body(ADULT_M, 0xd4b06a);
        adult.position.x = pick.hasKitty ? -0.38 : 0;
        add(adult);
      }
      if (pick.hasKitty) {
        const kit = body(KITTY_M, 0xc4a5ff, { kitty: true });
        kit.position.x = pick.hasAdult ? 0.32 : 0;
        add(kit);
      }
      if (!pick.hasAdult && !pick.hasKitty) {
        const adult = body(ADULT_M, 0xd4b06a);
        add(adult);
      }
    }

    const cam = snap(bible, pick.view);
    camera.position.copy(cam.pos);
    camera.lookAt(cam.look);
  }

  function resize() {
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || canvas.clientWidth || 640;
    const h = parent?.clientHeight || canvas.clientHeight || 360;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();

  let raf = 0;
  let running = true;
  let t0 = performance.now();

  function tick() {
    if (!running) return;
    const t = (performance.now() - t0) / 1000;
    if (!reduceMotion) {
      fill.intensity = 1.25 + Math.sin(t * 1.4) * 0.12;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();
  opts.onReady?.();

  layout({
    hasKitty: false,
    hasAdult: true,
    kittyMode: null,
    sit: false,
    cityScaleId: "walk",
    view: "front",
  });

  return {
    apply(pick) {
      layout(pick);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      wipeStage();
      for (const g of rootGeos) g.dispose();
      for (const m of rootMats) m.dispose();
      renderer.dispose();
    },
  };
}
