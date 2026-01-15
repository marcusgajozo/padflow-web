import { useEffectStore } from "@/lib/stores/use-effect-store";
import { useEffect } from "react";
import { Players, getContext, start } from "tone";
import { useAudioContextStart } from "./use-audio-context-start";

export function useEffectManager() {
  const effectPads = useEffectStore((state) => state.effectPads);
  const isInitialized = useEffectStore((state) => state.isInitialized);

  const setPlayEffect = useEffectStore((state) => state.setPlayEffect);
  const initializePads = useEffectStore((state) => state.initializePads);

  useAudioContextStart();

  useEffect(() => {
    if (!isInitialized) {
      initializePads();
    }
  }, [isInitialized, initializePads]);

  useEffect(() => {
    if (effectPads.length === 0) return;

    const urls: { [key: string]: string } = {};

    effectPads.forEach((pad) => {
      const url = URL.createObjectURL(pad.audioFile);
      urls[pad.id] = url;
    });

    const players = new Players(urls, () => {}).toDestination();

    setPlayEffect((effectId: string) => {
      try {
        const context = getContext();
        if (context.state === "suspended") {
          start().catch((error) => {
            console.error("Erro ao iniciar AudioContext:", error);
          });
          return;
        }

        const player = players.player(effectId);
        if (!player) {
          console.warn(`Player não encontrado para o efeito: ${effectId}`);
          return;
        }

        if (player.state === "started") {
          player.stop();
        }
        player.start();
      } catch (error) {
        console.error("Erro ao tocar efeito:", error);
      }
    });

    return () => {
      Object.entries(urls).forEach(([, url]) => {
        URL.revokeObjectURL(url);
      });
      players.dispose();
    };
  }, [effectPads, setPlayEffect]);
}
