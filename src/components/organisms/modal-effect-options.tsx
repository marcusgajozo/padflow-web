import { Modal } from "@/components/molecules/modal";
import { useModal } from "@/lib/hooks/use-modal";
import { useEffectStore } from "@/lib/stores/use-effect-store";

import { Trash2 } from "lucide-react";

export function ModalEffectOptions() {
  const { isOpen, data, close } = useModal<{ effectId: string }>(
    "effect-options"
  );
  const removePadId = useEffectStore((state) => state.removePadId);

  const handleDelete = () => {
    if (data?.effectId) {
      removePadId(data.effectId);
      close();
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={close}>
      <Modal.Title>Effect Options</Modal.Title>
      <Modal.Content>
        <div className="space-y-2">
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            Deletar efeito
          </button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
