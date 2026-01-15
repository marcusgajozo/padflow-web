import { useModal } from "@/lib/hooks/use-modal";
import { useRemoteHostStore } from "@/lib/stores/use-remote-host-store";
import { useMemo } from "react";
import QRCode from "react-qr-code";
import { Modal } from "../molecules/modal";

export function ModalActiveHost() {
  const { isOpen, close } = useModal("activeHost");
  const isRemoteHost = useRemoteHostStore((state) => state.isRemoteHost);
  const roomId = useRemoteHostStore((state) => state.roomId);

  const resetRemoteHost = useRemoteHostStore((state) => state.resetRemoteHost);
  const toggleStatusRemoteHost = useRemoteHostStore(
    (state) => state.toggleStatusRemoteHost
  );

  const remoteUrl = useMemo(() => {
    const origin = window.location.origin;

    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      const port = origin.split(":")[2] || "5173";
      return `http://${__LOCAL_IP__}:${port}/?session=${roomId}`;
    }

    return `${origin}/?session=${roomId}`;
  }, [roomId]);

  return (
    <Modal.Root open={isOpen} onOpenChange={close}>
      <Modal.Title>Remote Control</Modal.Title>
      <Modal.Content>
        {isRemoteHost && roomId ? (
          <div className="text-center space-y-4">
            <p className="text-slate-400">
              Scan the QR code with your mobile device to start controlling.
            </p>
            <div className="bg-white p-4 inline-block rounded-lg shadow-md">
              <QRCode value={remoteUrl} size={160} />
            </div>
            <p className="text-xs text-slate-500 pt-2">Room ID: {roomId}</p>
          </div>
        ) : (
          <p className="text-center text-slate-400">
            Do you want to activate the remote control?
          </p>
        )}
      </Modal.Content>
      <Modal.Buttons>
        <Modal.CloseButton onClick={close}>Close</Modal.CloseButton>
        <Modal.ActionButton
          onClick={() => {
            toggleStatusRemoteHost();
            if (isRemoteHost) {
              close();
              resetRemoteHost();
            }
          }}
        >
          {isRemoteHost
            ? "Deactivate Remote Control"
            : "Activate Remote Control"}
        </Modal.ActionButton>
      </Modal.Buttons>
    </Modal.Root>
  );
}
