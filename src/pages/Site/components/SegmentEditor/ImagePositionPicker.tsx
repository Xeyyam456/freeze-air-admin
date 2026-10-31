import type { ImagePositionPickerProps } from "@/types/site";
import { IMAGE_POSITIONS } from "../../constants/siteConstants";

// Şəkil saytda kəsiləndə görünən hissə: yuxarı / orta / aşağı
export function ImagePositionPicker({ value, onChange }: ImagePositionPickerProps) {
  return (
    <div className="mt-2">
      <span className="muted text-xs font-medium">Saytda şəklin hansı hissəsi görünsün</span>
      <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-bg p-1">
        {IMAGE_POSITIONS.map((p) => (
          <button key={p.value} type="button" onClick={() => onChange(p.value)}
            className={`rounded-md py-1 text-xs font-semibold transition-colors ${
              value === p.value ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-ink"
            }`}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
