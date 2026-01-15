import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { TYPES_EVENTS_CHANNEL } from "../constants/channel";
import { useEffectStore } from "../stores/use-effect-store";
import { useRemoteControlStore } from "../stores/use-remote-control-store";
import { useToneStore } from "../stores/use-tone-store";
import { useModal } from "./use-modal";

export function useRemoteControl() {
  const channelControl = useRemoteControlStore((state) => state.channelControl);
  const isRemoteControl = useRemoteControlStore(
    (state) => state.isRemoteControl
  );
  const connected = useRemoteControlStore((state) => state.connected);

  const { open } = useModal("remoteControlConnect");
  const setEffectPadsRemote = useEffectStore(
    (state) => state.setEffectPadsRemote
  );
  const setActiveTone = useToneStore((state) => state.setActiveTone);
  const setTonesIsloading = useToneStore((state) => state.setTonesIsloading);

  const [searchParams] = useSearchParams();
  const paramsRoomId = searchParams.get("session");

  useEffect(() => {
    if (connected) return;

    if (isRemoteControl || paramsRoomId) {
      open();
    }
  }, [connected, isRemoteControl, open, paramsRoomId]);

  useEffect(() => {
    if (!channelControl || !isRemoteControl) return;

    channelControl.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const hostLeft = leftPresences.some(
        (user: Record<string, unknown>) => user.user === "host"
      );
      if (hostLeft) {
        setTimeout(() => {
          open();
        }, 500);
      }
    });
  }, [channelControl, isRemoteControl, open]);

  useEffect(() => {
    if (!channelControl || !isRemoteControl) return;

    channelControl
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.HOST_SYNC_STATE },
        ({ payload }) => {
          if (payload.effectPads) {
            setEffectPadsRemote(payload.effectPads);
          }
        }
      )
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.TONE_ACTIVE },
        ({ payload }) => setActiveTone(payload.key)
      )
      .on(
        "broadcast",
        { event: TYPES_EVENTS_CHANNEL.TONE_IS_LOADING },
        ({ payload }) => setTonesIsloading(payload.tonesIsloading)
      );
  }, [
    channelControl,
    isRemoteControl,
    setActiveTone,
    setEffectPadsRemote,
    setTonesIsloading,
  ]);

  useEffect(() => {
    if (!channelControl || !isRemoteControl) return;

    channelControl.send({
      type: "broadcast",
      event: TYPES_EVENTS_CHANNEL.CLIENT_REQUEST_STATE,
    });
  }, [channelControl, isRemoteControl]);
}
