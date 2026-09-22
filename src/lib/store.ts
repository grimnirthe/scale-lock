import { create } from "zustand";
import { ROSTER } from "./roster";
import { type Aspect, type ScaleId, type WardrobePoseId, scaleById } from "./velora-scale";

type State = {
  selectedIds: string[];
  modes: Record<string, string>;
  isI2v: boolean;
  injectLocks: boolean;
  injectCity: boolean;
  prompt: string;
  scene: string;
  poseId: string;
  wardrobe: string;
  cityScaleId: ScaleId;
  whoId: string;
  whereId: string;
  wardrobePoseId: WardrobePoseId;
  aspect: Aspect;
  stillUrl: string | null;
  stillError: string | null;
  stillBusy: boolean;
  toggle: (id: string) => void;
  setMode: (id: string, modeId: string) => void;
  setPrompt: (v: string) => void;
  setScene: (v: string) => void;
  setPose: (id: string) => void;
  setWardrobe: (v: string) => void;
  setCityScale: (id: ScaleId) => void;
  setWho: (id: string) => void;
  setWhere: (id: string) => void;
  setWardrobePose: (id: WardrobePoseId) => void;
  setAspect: (v: Aspect) => void;
  setI2v: (v: boolean) => void;
  setInject: (v: boolean) => void;
  setInjectCity: (v: boolean) => void;
  setStill: (p: { url?: string | null; error?: string | null; busy?: boolean }) => void;
};

export const useLockStore = create<State>()((set, get) => ({
  selectedIds: ["nymph", "kitty"],
  modes: { nymph: "personal", kitty: "personal", vesper: "soft" },
  isI2v: false,
  injectLocks: true,
  injectCity: true,
  prompt: "",
  scene: "",
  poseId: "stand-viewer",
  wardrobe: "",
  cityScaleId: "walk",
  whoId: "none",
  whereId: "wet-street",
  wardrobePoseId: "three-quarter",
  aspect: "2:3",
  stillUrl: null,
  stillError: null,
  stillBusy: false,
  toggle: (id) => {
    const cur = get().selectedIds;
    set({
      selectedIds: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    });
  },
  setMode: (id, modeId) => set({ modes: { ...get().modes, [id]: modeId } }),
  setPrompt: (prompt) => set({ prompt }),
  setScene: (scene) => set({ scene }),
  setPose: (poseId) => set({ poseId }),
  setWardrobe: (wardrobe) => set({ wardrobe }),
  setCityScale: (cityScaleId) =>
    set({ cityScaleId, aspect: scaleById(cityScaleId).aspect }),
  setWho: (whoId) => set({ whoId }),
  setWhere: (whereId) => set({ whereId }),
  setWardrobePose: (wardrobePoseId) => set({ wardrobePoseId }),
  setAspect: (aspect) => set({ aspect }),
  setI2v: (isI2v) => set({ isI2v }),
  setInject: (injectLocks) => set({ injectLocks }),
  setInjectCity: (injectCity) => set({ injectCity }),
  setStill: ({ url, error, busy }) =>
    set({
      stillUrl: url === undefined ? get().stillUrl : url,
      stillError: error === undefined ? get().stillError : error,
      stillBusy: busy === undefined ? get().stillBusy : busy,
    }),
}));

export { ROSTER };
