import { useToneStore } from "@/lib/stores/use-tone-store";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useRef } from "react";
import { TYPES_EVENTS_CHANNEL } from "../constants/channel";
import { useEffectStore } from "../stores/use-effect-store";
import { useRemoteHostStore } from "../stores/use-remote-host-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useRemoteHost() {
  const isRemoteHost = useRemoteHostStore((state) => state.isRemoteHost);
  const channelHost = useRemoteHostStore((state) => state.channelHost);
  const effectPads = useEffectStore((state) => state.effectPads);
  const activeTone = useToneStore((state) => state.activeTone);
  const tonesIsloading = useToneStore((state) => state.tonesIsloading);
  const roomIdStore = useRemoteHostStore((state) => state.roomId);

  const setChannelHost = useRemoteHostStore((state) => state.setChannelHost);
  const setRoomId = useRemoteHostStore((state) => state.setRoomId);
  const playTone = useToneStore((state) => state.playTone);

  const playEffect = useEffectStore((state) => state.playEffect);
  const incrementQuantityControllers = useRemoteHostStore(
    (state) => state.incrementQuantityControllers
  );
  const decrementQuantityControllers = useRemoteHostStore(
    (state) => state.decrementQuantityControllers
  );

  const playEffectRef = useRef(playEffect);
  const playToneRef = useRef(playTone);
  const tonesIsloadingRef = useRef(tonesIsloading);
  const effectPadsRef = useRef(effectPads);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("[useRemoteHost] Atualizando refs:", {
      playTone: typeof playTone,
      playEffect: typeof playEffect,
    });
    playEffectRef.current = playEffect;
    playToneRef.current = playTone;
    tonesIsloadingRef.current = tonesIsloading;
    effectPadsRef.current = effectPads;
    console.log("[useRemoteHost] Refs atualizadas com sucesso");
  }, [playEffect, playTone, tonesIsloading, effectPads]);

  useEffect(() => {
    if (!isRemoteHost) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      return;
    }

    if (channelRef.current) return;

    const roomId =
      roomIdStore || `padflow-${Math.random().toString(36).slice(2, 8)}`;
    setRoomId(roomId);

    const channel = supabase.channel(roomId);
    channelRef.current = channel;
    setChannelHost(channel);
  }, [isRemoteHost, roomIdStore, setChannelHost, setRoomId]);

  useEffect(() => {
    if (!channelRef.current || !isRemoteHost) return;

    const channel = channelRef.current;

    // Remove listeners antigos antes de adicionar novos
    channel.unsubscribe();

    const setupListeners = () => {
      channel
        .on("presence", { event: "join" }, () => {
          incrementQuantityControllers();
        })
        .on("presence", { event: "leave" }, () => {
          decrementQuantityControllers();
        })
        .on(
          "broadcast",
          { event: TYPES_EVENTS_CHANNEL.PLAY_EFFECT },
          ({ payload }) => {
            try {
              console.log(
                "[PLAY_EFFECT] Recebido evento de play effect pelo canal",
                payload.effectId
              );
              console.log("[PLAY_EFFECT] Estado do ref:", {
                playEffectRefType: typeof playEffectRef.current,
                playEffectRefExists: !!playEffectRef.current,
                timestamp: new Date().toISOString(),
              });

              // Se a função ainda não está disponível, tenta novamente em 100ms
              if (!playEffectRef.current) {
                console.warn(
                  "[PLAY_EFFECT] playEffect ainda não está disponível, tentando novamente..."
                );
                setTimeout(() => {
                  if (playEffectRef.current) {
                    console.log(
                      "[PLAY_EFFECT] Executando playEffect após retry com id:",
                      payload.effectId
                    );
                    playEffectRef.current(payload.effectId);
                  } else {
                    console.error(
                      "[PLAY_EFFECT] playEffect não inicializado após retry"
                    );
                  }
                }, 100);
                return;
              }

              console.log(
                "[PLAY_EFFECT] Executando playEffect imediatamente com id:",
                payload.effectId
              );
              playEffectRef.current(payload.effectId);
            } catch (error) {
              console.error(
                "[PLAY_EFFECT] Erro ao executar playEffect:",
                error
              );
            }
          }
        )
        .on(
          "broadcast",
          { event: TYPES_EVENTS_CHANNEL.PLAY_TONE },
          ({ payload }) => {
            try {
              console.log(
                "[PLAY_TONE] Recebido evento de play tone pelo canal",
                payload.key
              );
              console.log("[PLAY_TONE] Estado do ref:", {
                playToneRefType: typeof playToneRef.current,
                playToneRefExists: !!playToneRef.current,
                timestamp: new Date().toISOString(),
              });

              // Se a função ainda não está disponível, tenta novamente em 100ms
              if (!playToneRef.current) {
                console.warn(
                  "[PLAY_TONE] playTone ainda não está disponível, tentando novamente em 100ms...",
                  {
                    payload,
                    timestamp: new Date().toISOString(),
                  }
                );
                setTimeout(() => {
                  console.log(
                    "[PLAY_TONE] Tentativa após 100ms. playToneRef:",
                    {
                      type: typeof playToneRef.current,
                      exists: !!playToneRef.current,
                    }
                  );
                  if (playToneRef.current) {
                    console.log(
                      "[PLAY_TONE] Executando playTone com key:",
                      payload.key
                    );
                    playToneRef.current(payload.key);
                  } else {
                    console.error(
                      "[PLAY_TONE] playTone não inicializado após retry"
                    );
                  }
                }, 100);
                return;
              }

              console.log(
                "[PLAY_TONE] Executando playTone imediatamente com key:",
                payload.key
              );
              playToneRef.current(payload.key);
            } catch (error) {
              console.error("[PLAY_TONE] Erro ao executar playTone:", error);
            }
          }
        )
        .on(
          "broadcast",
          { event: TYPES_EVENTS_CHANNEL.GET_TONE_IS_LOADING },
          () => {
            channel.send({
              type: "broadcast",
              event: TYPES_EVENTS_CHANNEL.TONE_IS_LOADING,
              payload: {
                tonesIsloading: tonesIsloadingRef.current,
              },
            });
          }
        )
        .on(
          "broadcast",
          { event: TYPES_EVENTS_CHANNEL.CLIENT_REQUEST_STATE },
          () => {
            channel.send({
              type: "broadcast",
              event: TYPES_EVENTS_CHANNEL.HOST_SYNC_STATE,
              payload: {
                effectPads: effectPadsRef.current.map((pad) => ({
                  id: pad.id,
                  name: pad.name,
                })),
              },
            });
          }
        );
    };

    setupListeners();

    channel.subscribe(async (status) => {
      console.log("Status do canal:", status);

      if (status === "SUBSCRIBED") {
        channel.track({ user: "host" });
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        console.warn("Conexão perdida. Tentando reconectar...");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        // Aguarda antes de reconectar
        reconnectTimeoutRef.current = setTimeout(async () => {
          console.log("Reconectando...");
          await channel.subscribe(async (newStatus) => {
            if (newStatus === "SUBSCRIBED") {
              console.log("Reconectado com sucesso!");
              channel.track({ user: "host" });
            }
          });
        }, 2000);
      }
    });

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [
    isRemoteHost,
    incrementQuantityControllers,
    decrementQuantityControllers,
  ]);

  useEffect(() => {
    if (!channelHost || !isRemoteHost) return;

    channelHost.send({
      type: "broadcast",
      event: TYPES_EVENTS_CHANNEL.HOST_SYNC_STATE,
      payload: {
        effectPads: effectPads.map((pad) => ({
          id: pad.id,
          name: pad.name,
        })),
      },
    });
  }, [channelHost, effectPads, isRemoteHost]);

  useEffect(() => {
    if (!channelHost || !isRemoteHost) return;

    channelHost.send({
      type: "broadcast",
      event: TYPES_EVENTS_CHANNEL.TONE_IS_LOADING,
      payload: {
        tonesIsloading,
      },
    });
  }, [channelHost, isRemoteHost, tonesIsloading]);

  useEffect(() => {
    if (!channelHost || !isRemoteHost) return;

    channelHost.send({
      type: "broadcast",
      event: TYPES_EVENTS_CHANNEL.TONE_ACTIVE,
      payload: {
        key: activeTone,
      },
    });
  }, [activeTone, channelHost, isRemoteHost]);
}
