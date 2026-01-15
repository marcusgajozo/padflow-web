import { useToneStore } from "@/lib/stores/use-tone-store";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useRef } from "react";
import { TYPES_EVENTS_CHANNEL } from "../constants/channel";
import { useEffectStore } from "../stores/use-effect-store";
import { useRemoteHostStore } from "../stores/use-remote-host-store";

export function useRemoteHost() {
  const isRemoteHost = useRemoteHostStore((state) => state.isRemoteHost);
  const channelHost = useRemoteHostStore((state) => state.channelHost);
  const effectPads = useEffectStore((state) => state.effectPads);
  const activeTone = useToneStore((state) => state.activeTone);
  const tonesIsloading = useToneStore((state) => state.tonesIsloading);

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

  useEffect(() => {
    playEffectRef.current = playEffect;
    playToneRef.current = playTone;
    tonesIsloadingRef.current = tonesIsloading;
    effectPadsRef.current = effectPads;
  }, [playEffect, playTone, tonesIsloading, effectPads]);

  useEffect(() => {
    if (!isRemoteHost) return;

    const roomId = `padflow-${Math.random().toString(36).slice(2, 8)}`;
    setRoomId(roomId);

    const channel = supabase.channel(roomId);
    setChannelHost(channel);

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
          console.log(
            "Recebido evento de play effect pelo canal",
            payload.effectId
          );
          playEffectRef.current?.(payload.effectId);
        }
      )
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.PLAY_TONE },
        ({ payload }) => {
          playToneRef.current?.(payload.key);
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
              toneIsloagind: tonesIsloadingRef.current,
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
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({ user: "host" });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setChannelHost(null);
    };
  }, [
    isRemoteHost,
    setChannelHost,
    setRoomId,
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
