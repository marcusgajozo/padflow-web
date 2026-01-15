import { useToneStore } from "@/lib/stores/use-tone-store";
import { supabase } from "@/lib/supabase-client";
import { useEffect } from "react";
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
    decrementQuantityControllers,
    incrementQuantityControllers,
    isRemoteHost,
    setChannelHost,
    setRoomId,
  ]);

  useEffect(() => {
    if (!channelHost || !isRemoteHost) return;

    channelHost
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.PLAY_EFFECT },
        ({ payload }) => playEffect?.(payload.effectId)
      )
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.PLAY_TONE },
        ({ payload }) => {
          playTone?.(payload.key);
        }
      )
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.GET_TONE_IS_LOADING },
        () => {
          channelHost.send({
            type: "broadcast",
            event: TYPES_EVENTS_CHANNEL.TONE_IS_LOADING,
            payload: {
              toneIsloagind: tonesIsloading,
            },
          });
        }
      )
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.CLIENT_REQUEST_STATE },
        () => {
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
        }
      );
  }, [
    channelHost,
    effectPads,
    isRemoteHost,
    playEffect,
    playTone,
    tonesIsloading,
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
