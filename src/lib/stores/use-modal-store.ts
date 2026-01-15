import { create } from 'zustand'

type ModalState<T = Record<string, unknown>> = {
  isOpen: boolean
  data?: T
}

type ModalStoreState = {
  modals: Map<string, ModalState>
}

type ModalStoreActions = {
  openModal: <T = ModalState['data']>(modalId: string, data?: T) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  isModalOpen: (modalId: string) => ModalState['isOpen']
  getModalData: (modalId: string) => ModalState['data']
  closeAllModals: () => void
}

export const useModalStore = create<ModalStoreState & ModalStoreActions>(
  (set, get) => ({
    modals: new Map(),

    openModal: (modalId, data) =>
      set(state => {
        const newModals = new Map(state.modals)
        newModals.set(modalId, {
          isOpen: true,
          data: data as Record<string, unknown>,
        })
        return { modals: newModals }
      }),

    closeModal: modalId =>
      set(state => {
        const newModals = new Map(state.modals)
        newModals.set(modalId, { isOpen: false })
        return { modals: newModals }
      }),

    toggleModal: modalId =>
      set(state => {
        const newModals = new Map(state.modals)
        const currentModal = newModals.get(modalId)
        const isOpen = currentModal?.isOpen ?? false
        newModals.set(modalId, {
          isOpen: !isOpen,
          data: isOpen ? undefined : currentModal?.data,
        })
        return { modals: newModals }
      }),

    isModalOpen: modalId => get().modals.get(modalId)?.isOpen ?? false,

    getModalData: modalId => get().modals.get(modalId)?.data,

    closeAllModals: () => set(() => ({ modals: new Map() })),
  })
)
