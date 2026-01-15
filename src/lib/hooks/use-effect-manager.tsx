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

    console.log("🔄 Recriando a coleção de players de efeitos...");

    const urls: { [key: string]: string } = {};

    effectPads.forEach((pad) => {
      const url = URL.createObjectURL(pad.audioFile);
      urls[pad.id] = url;
    });

    const players = new Players(urls, () => {
      console.log("✅ Todos os efeitos foram carregados/recarregados.");
    }).toDestination();

    setPlayEffect((effectId: string) => {
      const player = players.player(effectId);
      if (player) {
        if (player.state === "started") {
          player.restart();
        } else {
          player.start();
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
