import { useEffect, useRef } from "react";
import { getContext, start } from "tone";

export function useAudioContextStart() {
  const contextStartedRef = useRef(false);

  useEffect(() => {
    const startAudioContext = async () => {
      if (!contextStartedRef.current && getContext().state === "suspended") {
        try {
          await start();
          contextStartedRef.current = true;
          console.log("AudioContext iniciado");
        } catch (error) {
          console.error("Erro ao iniciar AudioContext:", error);
        }
      }
    };

    window.addEventListener("click", startAudioContext, { once: true });
    window.addEventListener("touchstart", startAudioContext, { once: true });
    window.addEventListener("keydown", startAudioContext, { once: true });

    return () => {
      window.removeEventListener("click", startAudioContext);
      window.removeEventListener("touchstart", startAudioContext);
      window.removeEventListener("keydown", startAudioContext);
    };
  }, []);
}
