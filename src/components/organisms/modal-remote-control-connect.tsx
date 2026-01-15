import { useModal } from "@/lib/hooks/use-modal";
import { useRemoteControlStore } from "@/lib/stores/use-remote-control-store";
import { supabase } from "@/lib/supabase-client";
import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Modal } from "../molecules/modal";

export function ModalRemoteControlConnect() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, close } = useModal("remoteControlConnect");
  const setChannelControl = useRemoteControlStore(
    (state) => state.setChannelControl
  );
  const setRoomId = useRemoteControlStore((state) => state.setRoomId);
  const resetControl = useRemoteControlStore((state) => state.resetControl);
  const roomIdStore = useRemoteControlStore((state) => state.roomId);

  const [searchParams] = useSearchParams();
  const paramsRoomId = searchParams.get("session");

  const navigate = useNavigate();

  const handleConnect = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    const roomId = paramsRoomId || roomIdStore;

    if (!roomId) return;

    const channel = supabase.channel(roomId);

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const presenceState = await channel.presenceState();

        const hasHost = Object.values(presenceState).some(
          (users: Record<string, unknown>[]) =>
            Array.isArray(users) && users.some((user) => user.user === "host")
        );

        if (!hasHost) {
          setError("Nenhum host disponível. Tente novamente mais tarde.");
          setIsLoading(false);
          supabase.removeChannel(channel);
          return;
        }

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

  const handleClose = () => {
    navigate("/");
    resetControl();
    close();
    setError(null);
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={handleClose}>
      <Modal.Title>Remote Control</Modal.Title>
      <Modal.Content>
        <p className="text-center text-slate-400">
          you want to connect to the host?
        </p>
        {error && (
          <p className="text-center text-red-400 mt-2 text-sm">{error}</p>
        )}
      </Modal.Content>
      <Modal.Buttons>
        <Modal.CloseButton onClick={handleClose}>Close</Modal.CloseButton>
        <Modal.ActionButton
          onClick={() => {
            handleConnect();
          }}
          isLoading={isLoading}
        >
          Connect
        </Modal.ActionButton>
      </Modal.Buttons>
    </Modal.Root>
  );
}
