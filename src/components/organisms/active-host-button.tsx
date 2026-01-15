"use client";

import { useModal } from "@/lib/hooks/use-modal";
import { useRemoteControlStore } from "@/lib/stores/use-remote-control-store";
import { useRemoteHostStore } from "@/lib/stores/use-remote-host-store";
import { cn } from "@/lib/utils";
import { Cloud, CloudOff, Gamepad2 } from "lucide-react";
import { Icon } from "../atoms/icon";

export const ActiveHostButton = () => {
  const isRemoteHost = useRemoteHostStore((state) => state.isRemoteHost);

  const isRemoteControl = useRemoteControlStore(
    (state) => state.isRemoteControl
  );

  const { open: openActiveHost } = useModal("activeHost");
  const { open: openRemoteControl } = useModal("remoteControlDisconnect");

  const handleClick = () => {
    if (isRemoteControl) {
      openRemoteControl();
      return;
    }
    openActiveHost();
  };

  return (
    <button
      className={cn(
        "relative w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 group",
        isRemoteControl
          ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:ring-red-500"
          : isRemoteHost
          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500"
          : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 focus:ring-slate-500"
      )}
      onClick={handleClick}
      aria-label={
        isRemoteControl
          ? "Remote control mode active"
          : isRemoteHost
          ? "Disable remote host"
          : "Enable remote host"
      }
    >
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300",
          isRemoteControl
            ? "bg-red-400"
            : isRemoteHost
            ? "bg-emerald-400"
            : "bg-slate-400"
        )}
      />

      {/* Icon container */}
      <div className="relative flex items-center justify-center w-full h-full">
        <Icon
          icon={isRemoteControl ? Gamepad2 : isRemoteHost ? Cloud : CloudOff}
          size="lg"
          className="text-white transition-all duration-300"
        />
      </div>

      {/* Status indicator dot */}
      <div
        className={cn(
          "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 transition-all duration-300",
          isRemoteControl
            ? "bg-red-400 shadow-red-400/50 shadow-lg animate-pulse"
            : isRemoteHost
            ? "bg-emerald-400 shadow-emerald-400/50 shadow-lg"
            : "bg-slate-500"
        )}
      />
    </button>
  );
};
