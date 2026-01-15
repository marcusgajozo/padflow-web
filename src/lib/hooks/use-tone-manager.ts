import { padsContinuos } from "@/lib/constants/pads";
import { useEffect, useRef } from "react";
import { Players, getContext, start } from "tone";
import { useRemoteControlStore } from "../stores/use-remote-control-store";
import { useToneStore } from "../stores/use-tone-store";
import { isMobile } from "../utils";
import { useAudioContextStart } from "./use-audio-context-start";

export function useToneManager() {
  const tonesIsloading = useToneStore((state) => state.tonesIsloading);
  const playersRef = useRef<Players | null>(null);
  const isRemoteControl = useRemoteControlStore(
    (state) => state.isRemoteControl
  );

  const setActiveTone = useToneStore((state) => state.setActiveTone);
  const setPlayTone = useToneStore((state) => state.setPlayTone);
  const setTonesIsloading = useToneStore((state) => state.setTonesIsloading);

  // Inicia o AudioContext na primeira interação do usuário
  useAudioContextStart();

  useEffect(() => {
    console.log(
      "[useToneManager] Inicializando. isRemoteControl:",
      isRemoteControl
    );
    if (isRemoteControl || isMobile()) {
      setTonesIsloading(false);
      return;
    }

    // Configuração dos players com volume inicial e fade
    const players = new Players(padsContinuos, () => {
      console.log("[useToneManager] Players carregados com sucesso");
      setTonesIsloading(false);
    });

    // Conecta ao destino (saída de áudio)
    players.toDestination();

    // Configura fadeOut para evitar cliques secos ao trocar
    players.fadeOut = "0.1s";
    players.fadeIn = "0.1s";

    playersRef.current = players;

    return () => {
      console.log("[useToneManager] Limpando Players");
      players.dispose();
    };
  }, [isRemoteControl, setTonesIsloading]);

  useEffect(() => {
    const players = playersRef.current;

    if (!players) return;

    setPlayTone((toneToPlay) => {
      console.log("[useToneManager] Comando recebido para:", toneToPlay);

      // Atualiza estado visual
      setActiveTone(toneToPlay);

      (async () => {
        try {
          const context = getContext();

          // 1. Força o resume do AudioContext se estiver suspenso
          // Isso é CRÍTICO para comandos via WebSocket (Remote)
          if (context.state === "suspended") {
            console.log(
              "[useToneManager] Contexto suspenso. Tentando retomar..."
            );
            await start().catch((error) => {
              console.error(
                "[useToneManager] Erro ao iniciar AudioContext:",
                error
              );
            });
            // Aguarda transição de estado
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // 2. Lógica de Parada Manual (Substitui o stopAll)
          // Percorre todos os pads cadastrados usando Object.keys
          Object.keys(padsContinuos).forEach((padKey) => {
            // Se o pad não é o que queremos tocar agora, paramos ele
            if (padKey !== toneToPlay) {
              if (players.has(padKey)) {
                const otherPlayer = players.player(padKey);
                if (otherPlayer.state === "started") {
                  console.log(
                    `[useToneManager] Parando som anterior: ${padKey}`
                  );
                  otherPlayer.stop();
                }
              }
            }
          });

          // 3. Lógica do Player Alvo
          if (players.has(toneToPlay)) {
            const targetPlayer = players.player(toneToPlay);

            if (targetPlayer.state === "started") {
              // Se já está tocando e clicou no mesmo, paramos (toggle off)
              console.log(
                `[useToneManager] Parando tom atual (toggle): ${toneToPlay}`
              );
              targetPlayer.stop();
            } else {
              // Inicia o novo som
              console.log(`[useToneManager] Iniciando novo tom: ${toneToPlay}`);
              targetPlayer.start();
            }
          } else {
            console.error(
              `[useToneManager] Player ${toneToPlay} não encontrado na lista.`
            );
          }
        } catch (error) {
          console.error(
            "[useToneManager] Erro fatal ao manipular áudio:",
            error
          );
        }
      })();
    });
  }, [tonesIsloading, setActiveTone, setPlayTone]);
}
