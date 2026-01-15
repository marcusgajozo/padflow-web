import { useModal } from "@/lib/hooks/use-modal";
import { useRemoteControlStore } from "@/lib/stores/use-remote-control-store";
import { Modal } from "../molecules/modal";

export function ModalRemoteControlDisconnect() {
  const { isOpen, close } = useModal("remoteControlDisconnect");

  const resetControl = useRemoteControlStore((state) => state.resetControl);

  return (
    <Modal.Root open={isOpen} onOpenChange={close}>
      <Modal.Title>Remote Control</Modal.Title>
      <Modal.Content>
        <p className="text-center text-slate-400">
          you want to disconnect from the host?
        </p>
      </Modal.Content>
      <Modal.Buttons>
        <Modal.CloseButton onClick={close}>Close</Modal.CloseButton>
        <Modal.ActionButton
          onClick={() => {
            resetControl();
            close();
          }}
        >
          Disconnect
        </Modal.ActionButton>
      </Modal.Buttons>
    </Modal.Root>
  );
}
