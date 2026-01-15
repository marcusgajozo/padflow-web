import type { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface RemoteControlStoreState {
  isRemoteControl: boolean;
  roomId: string | null;
  channelControl: RealtimeChannel | null;
}

interface RemoteControlStoreActions {
  setIsRemoteControl: (
    isRemoteControl: RemoteControlStoreState["isRemoteControl"]
  ) => void;
  setRoomId: (roomId: RemoteControlStoreState["roomId"]) => void;
  setChannelControl: (
    channelControl: RemoteControlStoreState["channelControl"]
  ) => void;
  resetControl: () => void;
}

const INITIAL_STATE: RemoteControlStoreState = {
  isRemoteControl: false,
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
        setIsRemoteControl: (isRemoteControl) =>
          set(() => ({ isRemoteControl })),
        setRoomId: (roomId) => set(() => ({ roomId: roomId })),
        setChannelControl: (channelControl) => set(() => ({ channelControl })),
        resetControl: () => set(() => ({ ...INITIAL_STATE })),
      }),
      { name: "remote-control-store" }
    )
  )
);
