import { CardBase } from "@/components/atoms/card-base";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react";
import { useRef } from "react";

interface EffectCardProps extends React.ComponentProps<typeof CardBase> {
  onPlayEfeect: () => void;
  onLongPress?: () => void;
  name: string;
}

const LONG_PRESS_DURATION = 500;

export function EffectCard({
  onPlayEfeect,
  onLongPress,
  name,
  className,
  ...props
}: EffectCardProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleMouseDown = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress?.();
    }, LONG_PRESS_DURATION);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    if (!isLongPressRef.current) {
      onPlayEfeect();
    }
  };

  const handleTouchStart = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress?.();
    }, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    if (!isLongPressRef.current) {
      onPlayEfeect();
    }
  };

  return (
    <CardBase
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn("aspect-square group ", className)}
      {...props}
    >
      <div className="text-center text-white">
        <Icon icon={Volume2} size="lg" className="mx-auto mb-2" />
        <div className="text-sm font-medium truncate px-2 max-w-full">
          {name}
        </div>
      </div>
    </CardBase>
  );
}
