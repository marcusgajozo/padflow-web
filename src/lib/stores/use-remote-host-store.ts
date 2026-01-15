import type { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface RemoteHostStoreState {
  isRemoteHost: boolean;
  quantityControllers: number;
  roomId: string | null;
  channelHost: RealtimeChannel | null;
}

interface RemoteHostStoreActions {
  setIsRemoteHost: (isRemoteHost: RemoteHostStoreState["isRemoteHost"]) => void;
  setRoomId: (roomId: RemoteHostStoreState["roomId"]) => void;
  setChannelHost: (channelHost: RemoteHostStoreState["channelHost"]) => void;
  toggleStatusRemoteHost: () => void;
  incrementQuantityControllers: () => void;
  decrementQuantityControllers: () => void;
  resetRemoteHost: () => void;
}

const INITIAL_STATE: RemoteHostStoreState = {
  isRemoteHost: false,
  quantityControllers: 0,
  roomId: null,
  channelHost: null,
};

export const useRemoteHostStore = create<
  RemoteHostStoreState & RemoteHostStoreActions
>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_STATE,
        toggleStatusRemoteHost: () =>
          set(({ isRemoteHost }) => ({
            isRemoteHost: !isRemoteHost,
          })),
        setIsRemoteHost: (isRemoteHost) => set(() => ({ isRemoteHost })),
        incrementQuantityControllers: () =>
          set((state) => ({
            quantityControllers: state.quantityControllers + 1,
          })),
        decrementQuantityControllers: () =>
          set((state) => ({
            quantityControllers: Math.max(state.quantityControllers - 1, 0),
          })),
        setRoomId: (roomId) => set(() => ({ roomId: roomId })),
        setChannelHost: (channelHost) => set(() => ({ channelHost })),
        resetRemoteHost: () => set(() => ({ ...INITIAL_STATE })),
      }),
      {
        name: "remote-host-store",
        partialize: (state) => {
          const { channelHost: _, ...rest } = state;
          return rest;
        },
      }
    )
  )
);
