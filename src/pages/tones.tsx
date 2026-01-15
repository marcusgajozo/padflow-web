import { CardBaseSkeleton } from "@/components/atoms/card-base-skeleton";
import { ToneCard } from "@/components/molecules/tone-card";
import { CardGrid } from "@/components/organisms/card-grid";
import { TYPES_EVENTS_CHANNEL } from "@/lib/constants/channel";
import { padsContinuos } from "@/lib/constants/pads";
import { useRemoteControlStore } from "@/lib/stores/use-remote-control-store";
import { useToneStore } from "@/lib/stores/use-tone-store";
import { isMobile } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";

type PadKey = keyof typeof padsContinuos;

const MUSICAL_KEYS = Object.entries(padsContinuos).map(([key]) => key);

export function Tones() {
  const channelControl = useRemoteControlStore((state) => state.channelControl);
  const isRemoteControl = useRemoteControlStore(
    (state) => state.isRemoteControl
  );

  const activeTone = useToneStore((state) => state.activeTone);
  const tonesIsloading = useToneStore((state) => state.tonesIsloading);

  const playTone = useToneStore((state) => state.playTone);

  const handleToneToggle = (tone: PadKey) => {
    if (isRemoteControl && channelControl) {
      channelControl.send({
        type: "broadcast",
        event: TYPES_EVENTS_CHANNEL.PLAY_TONE,
        payload: { key: tone },
      });
      return;
    }
    playTone?.(tone);
  };

  if (isMobile() && !isRemoteControl) {
    return (
      <div className="space-y-6">
        <p className="text-center text-slate-400">
          Musical tones are not available on mobile devices. Please access the
          application from a desktop or laptop for the full experience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
          Musical Tones
        </h2>
        <p className="text-slate-400">
          Select a key for continuous ambient background pads
        </p>
      </div>

      <CardGrid>
        {MUSICAL_KEYS.map((tone, index) => (
          <Fragment key={`tone-${tone}-${index}`}>
            {tonesIsloading && <CardBaseSkeleton className="aspect-square" />}
            {!tonesIsloading && (
              <ToneCard
                tone={tone as PadKey}
                active={activeTone === tone}
                onToneToggle={() => handleToneToggle(tone as PadKey)}
              />
            )}
          </Fragment>
        ))}
      </CardGrid>
    </div>
  );
}
