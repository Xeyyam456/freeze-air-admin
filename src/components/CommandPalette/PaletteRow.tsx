import { CornerDownLeft } from "lucide-react";
import type { PaletteRowProps } from "@/types/layout";

// Nəticə sətri; head — qrup başlığı (qrupun ilk sətrində)
export function PaletteRow({ item: i, index, active, head, onHover, onOpen }: PaletteRowProps) {
  const Icon = i.icon;
  return (
    <div>
      {head && <p className="cmdk-group">{head}</p>}
      <button type="button" data-index={index} className="cmdk-item" aria-selected={active}
        onMouseMove={() => onHover(index)} onClick={() => onOpen(i)}>
        <span className="cmdk-icon"><Icon size={16} /></span>
        <span className="min-w-0 flex-1 truncate">
          <span className="font-semibold">{i.label}</span>
          {i.hint && <span className="muted ml-2 text-xs">{i.hint}</span>}
        </span>
        {active && <CornerDownLeft size={15} className="muted" />}
      </button>
    </div>
  );
}
