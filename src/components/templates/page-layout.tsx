import { MainHeader } from "@/components/organisms/main-header";
import { useEffectManager } from "@/lib/hooks/use-effect-manager";
import { useRemoteControl } from "@/lib/hooks/use-remote-control";
import { useRemoteHost } from "@/lib/hooks/use-remote-host";
import { useToneManager } from "@/lib/hooks/use-tone-manager";
import { Outlet } from "react-router";
import { ActiveHostButton } from "../organisms/active-host-button";
import { ModalActiveHost } from "../organisms/modal-active-host";
import { ModalRemoteControlConnect } from "../organisms/modal-remote-control-connect";
import { ModalRemoteControlDisconnect } from "../organisms/modal-remote-control-disconnect";

export function PageLayout() {
  useEffectManager();
  useRemoteControl();
  useToneManager();
  useRemoteHost();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>
      <div className="fixed bottom-8 right-7 z-50">
        <ActiveHostButton />
        <ModalActiveHost />
        <ModalRemoteControlConnect />
        <ModalRemoteControlDisconnect />
      </div>
    </div>
  );
}
