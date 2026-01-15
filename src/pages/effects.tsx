import { AddPadButton } from "@/components/molecules/add-pad-button";
import { EffectCard } from "@/components/molecules/effect-card";
import { CardGrid } from "@/components/organisms/card-grid";
import { ModalEffectOptions } from "@/components/organisms/modal-effect-options";
import { TYPES_EVENTS_CHANNEL } from "@/lib/constants/channel";
import { useModal } from "@/lib/hooks/use-modal";
import { useEffectStore } from "@/lib/stores/use-effect-store";
import { useRemoteControlStore } from "@/lib/stores/use-remote-control-store";

export function Effects() {
  const channelControl = useRemoteControlStore((state) => state.channelControl);
  const effectPadsStore = useEffectStore((state) => state.effectPads);
  const effectPadsRemote = useEffectStore((state) => state.effectPadsRemote);
  const isRemoteControl = useRemoteControlStore(
    (state) => state.isRemoteControl
  );

  const playEffect = useEffectStore((state) => state.playEffect);
  const addNewPad = useEffectStore((state) => state.addNewPad);

  const effectPads = isRemoteControl ? effectPadsRemote : effectPadsStore;

  const { open: openEffectOptions } = useModal<{ effectId: string }>(
    "effect-options"
  );

  const handleFileSelected = (file: File) => {
    addNewPad(file);
  };

  const handlePlayEffect = (effectId: string) => {
    if (isRemoteControl && channelControl) {
      channelControl.send({
        type: "broadcast",
        event: TYPES_EVENTS_CHANNEL.PLAY_EFFECT,
        payload: { effectId },
      });
      return;
    }
    playEffect?.(effectId);
  };

  const handleLongPressEffect = (effectId: string) => {
    if (!isRemoteControl) {
      openEffectOptions({ effectId });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
            Effect Soundboard
          </h2>
          <p className="text-slate-400">
            Create your custom soundboard with one-shot effects
          </p>
        </div>
        <CardGrid>
          {effectPads.map((effect) => (
            <EffectCard
              key={effect.id}
              onPlayEfeect={() => handlePlayEffect(effect.id)}
              onLongPress={() => handleLongPressEffect(effect.id)}
              name={effect.name}
            />
          ))}
          {!isRemoteControl && (
            <AddPadButton onFileSelected={handleFileSelected} />
          )}
        </CardGrid>
      </div>
      <ModalEffectOptions />
    </>
  );
}
