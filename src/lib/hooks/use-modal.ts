import { useModalStore } from "../stores/use-modal-store";

export const useModal = <T = Record<string, unknown>>(modalId: string) => {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const toggleModal = useModalStore((state) => state.toggleModal);

  const isOpen = useModalStore(
    (state) => state.modals.get(modalId)?.isOpen ?? false
  );
  const data = useModalStore(
    (state) => state.modals.get(modalId)?.data as T | undefined
  );

  return {
    isOpen,
    data,
    open: (data?: T) => openModal<T>(modalId, data),
    close: () => closeModal(modalId),
    toggle: () => toggleModal(modalId),
  };
};
