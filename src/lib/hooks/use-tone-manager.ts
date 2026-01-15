import { padsContinuos } from "@/lib/constants/pads";
import { useEffect, useRef } from "react";
import { Players } from "tone";
import { useToneStore } from "../stores/use-tone-store";
import { useRemoteControlStore } from "../stores/use-remote-control-store";

export function useToneManager() {
  const tonesIsloading = useToneStore((state) => state.tonesIsloading);
  const playersRef = useRef<Players | null>(null);
  const isRemoteControl = useRemoteControlStore(
    (state) => state.isRemoteControl
  );

  const setActiveTone = useToneStore((state) => state.setActiveTone);
  const setPlayTone = useToneStore((state) => state.setPlayTone);
  const setTonesIsloading = useToneStore((state) => state.setTonesIsloading);

  useEffect(() => {
    if (isRemoteControl) return;

    const players = new Players({
      urls: padsContinuos,
      fadeIn: 0.3,
      fadeOut: 0.6,
      onload() {
        setTonesIsloading(false);
      },
    }).toDestination();

    playersRef.current = players;

    return () => {
      players.dispose();
    };
  }, [isRemoteControl, setTonesIsloading]);

  useEffect(() => {
    const players = playersRef.current;
    if (!players) return;

    setPlayTone((tone) => {
      setActiveTone(tone);
      const player = players.player(tone);
      if (player) {
        player.loop = true;
        if (player.state === "started") {
          player.stop();
        } else {
          players.stopAll();
          player.start();
        }
      }
    });
  }, [tonesIsloading, setActiveTone, setPlayTone]);
}
