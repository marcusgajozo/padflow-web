import { CardBase } from "@/components/atoms/card-base";
import { Icon } from "@/components/atoms/icon";
import { Plus } from "lucide-react";
import { useRef } from "react";

interface AddPadButtonProps {
  onFileSelected: (file: File) => void;
}

export function AddPadButton({ onFileSelected }: AddPadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleCardClick = () => inputRef.current?.click();
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelected(event.target.files[0]);
      inputRef.current!.value = "";
    }
  };
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        className="hidden"
        accept="audio/*"
      />
      <CardBase
        variant="add"
        onClick={handleCardClick}
        className="aspect-square"
      >
        <div className="text-center text-slate-400">
          <Icon icon={Plus} size="lg" className="mx-auto mb-2" />
          <div className="text-sm font-medium">Add New Pad</div>
        </div>
      </CardBase>
    </>
  );
}
