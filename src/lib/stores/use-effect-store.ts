import { del, get, keys, set } from "idb-keyval";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface EffectPad {
  id: string;
  name: string;
  audioFile: File;
}
interface EffectPadRemote {
  id: string;
  name: string;
}

interface EffectStoreState {
  effectPads: EffectPad[];
  effectPadsRemote: EffectPadRemote[];
  isInitialized: boolean;
  playEffect: null | ((effectId: string) => void);
}

interface EffectStoreActions {
  initializePads: () => Promise<void>;
  addNewPad: (file: File) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setEffectPadsRemote: (effectPadsRemote: EffectPadRemote[]) => void;
  setPlayEffect: (playEffect: EffectStoreState["playEffect"]) => void;
  removePadId: (id: string) => void;
}

const INITIAL_EFFECT: EffectStoreState = {
  isInitialized: false,
  effectPads: [],
  effectPadsRemote: [],
  playEffect: null,
};

export const useEffectStore = create<EffectStoreState & EffectStoreActions>()(
  devtools(
    (setState) => ({
      ...INITIAL_EFFECT,

      initializePads: async () => {
        try {
          const padKeys = await keys();
          const pads: EffectPad[] = [];
          for (const key of padKeys) {
            if (typeof key === "string" && key.startsWith("effect-")) {
              const pad = await get<EffectPad>(key);
              if (pad) {
                pads.push(pad);
              }
            }
          }
          setState({ effectPads: pads, isInitialized: true });
        } catch {
          setState({ isInitialized: true });
        }
      },

      addNewPad: async (file) => {
        const newPad: EffectPad = {
          id: `effect-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          audioFile: file,
        };

        await set(newPad.id, newPad);
        setState((state) => ({
          effectPads: [...state.effectPads, newPad],
        }));
      },

      handleDelete: async (id) => {
        await del(id);
        setState((state) => ({
          effectPads: state.effectPads.filter((pad) => pad.id !== id),
        }));
      },

      setEffectPadsRemote: (effectPadsRemote) => {
        setState({
          effectPadsRemote,
        });
      },

      setPlayEffect: (playEffect) => setState({ playEffect }),
      removePadId: (id) =>
        setState((state) => {
          del(id);

          return {
            effectPads: state.effectPads.filter((pad) => pad.id !== id),
          };
        }),
    }),
    { name: "effect-store" }
  )
);
