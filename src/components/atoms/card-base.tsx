import { cn } from "@/lib/utils";

interface CardBaseProps {
  onClick?: () => void;
  active?: boolean;
  variant?: "default" | "add" | "empty";
}

export function CardBase({
  children,
  className,
  onClick,
  active = false,
  variant = "default",
  ...props
}: CardBaseProps & React.HTMLAttributes<HTMLDivElement>) {
  const baseStyles =
    "rounded-2xl transition-all duration-200 cursor-pointer select-none min-h-[120px] flex items-center justify-center relative overflow-hidden";

  const variants = {
    default: `bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-lg hover:shadow-xl active:scale-95 ${
      active
        ? "ring-2 ring-blue-400 shadow-blue-400/25 bg-gradient-to-br from-blue-600 to-purple-700"
        : ""
    }`,
    add: "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-2 border-dashed border-slate-500 hover:border-slate-400 hover:bg-slate-700/70 active:scale-95",
    empty:
      "bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 active:scale-95",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
