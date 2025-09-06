interface AdSlotProps {
  slot: string;
  width?: number;
  height?: number;
  className?: string;
}

export function AdSlot({ slot, width = 300, height = 250, className }: AdSlotProps) {
  return (
    <div
      className={`ad-slot bg-gray-100 border flex items-center justify-center text-xs text-gray-500 ${className ?? ""}`}
      style={{ width, height }}
    >
      Ad Space – {slot}
    </div>
  );
}
