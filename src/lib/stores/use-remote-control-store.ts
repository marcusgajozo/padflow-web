import type { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface RemoteControlStoreState {
  isRemoteControl: boolean;
  roomId: string | null;
  channelControl: RealtimeChannel | null;
  connected: boolean;
}

interface RemoteControlStoreActions {
  setRoomId: (roomId: RemoteControlStoreState["roomId"]) => void;
  setChannelControl: (
    channelControl: RemoteControlStoreState["channelControl"]
  ) => void;
  resetControl: () => void;
}

const INITIAL_STATE: RemoteControlStoreState = {
  isRemoteControl: false,
  connected: false,
  roomId: null,
  channelControl: null,
};

export const useRemoteControlStore = create<
  RemoteControlStoreState & RemoteControlStoreActions
>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_STATE,
        setRoomId: (roomId) => set(() => ({ roomId: roomId })),
        setChannelControl: (channelControl) =>
          set(() => {
            return { channelControl, connected: true, isRemoteControl: true };
          }),
        resetControl: () => set(() => ({ ...INITIAL_STATE })),
      }),
      {
        name: "remote-control-store",
        partialize: (state) => {
          const { channelControl: _, connected: __, ...rest } = state;
          return rest;
        },
      }
    )
  )
);
