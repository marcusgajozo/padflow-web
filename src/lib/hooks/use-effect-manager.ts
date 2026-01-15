import { useEffectStore } from "@/lib/stores/use-effect-store";
import { useEffect } from "react";
import { Players } from "tone";

export function useEffectManager() {
  const effectPads = useEffectStore((state) => state.effectPads);
  const isInitialized = useEffectStore((state) => state.isInitialized);

  const setPlayEffect = useEffectStore((state) => state.setPlayEffect);

  const initializePads = useEffectStore((state) => state.initializePads);

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
      const player = players.player(effectId);
      if (player) {
        try {
          if (player.state === "started") {
            player.stop();
          }
          player.start();
        } catch (error) {
          console.error("Erro ao tocar efeito:", error);
        }
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
