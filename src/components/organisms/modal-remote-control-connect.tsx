import { useModal } from "@/lib/hooks/use-modal";
import { useRemoteControlStore } from "@/lib/stores/use-remote-control-store";
import { supabase } from "@/lib/supabase-client";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { Modal } from "../molecules/modal";

export function ModalRemoteControlConnect() {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, close } = useModal("remoteControlConnect");
  const setChannelControl = useRemoteControlStore(
    (state) => state.setChannelControl
  );
  const setRoomId = useRemoteControlStore((state) => state.setRoomId);
  const resetControl = useRemoteControlStore((state) => state.resetControl);
  const roomIdStore = useRemoteControlStore((state) => state.roomId);

  const [searchParams] = useSearchParams();
  const paramsRoomId = searchParams.get("session");

  const handleConnect = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    const roomId = paramsRoomId || roomIdStore;

    if (!roomId) return;

    const channel = supabase.channel(roomId);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ user: "controller" });
        setRoomId(roomId);
        setChannelControl(channel);
        close();
        setIsLoading(false);
      }
    });
  }, [
    close,
    isLoading,
    paramsRoomId,
    roomIdStore,
    setChannelControl,
    setRoomId,
  ]);

  return (
    <Modal.Root open={isOpen} onOpenChange={close}>
      <Modal.Title>Remote Control</Modal.Title>
      <Modal.Content>
        <p className="text-center text-slate-400">
          you want to connect to the host?
        </p>
      </Modal.Content>
      <Modal.Buttons>
        <Modal.CloseButton
          onClick={() => {
            resetControl();
            close();
          }}
        >
          Close
        </Modal.CloseButton>
        <Modal.ActionButton
          onClick={() => {
            handleConnect();
          }}
          disabled={isLoading}
        >
          Connect
        </Modal.ActionButton>
      </Modal.Buttons>
    </Modal.Root>
  );
}
