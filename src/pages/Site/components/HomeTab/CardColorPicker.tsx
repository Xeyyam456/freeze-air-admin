import type { CardColorPickerProps } from "@/types/site";
import { CARD_COLORS } from "../../constants/homeConstants";

// Kartın rəngi: 4 saytın palitrasından biri
export function CardColorPicker({ color, onColor }: CardColorPickerProps) {
  return (
    <fieldset>
      <legend className="label">Kartın rəngi</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CARD_COLORS.map((x) => (
          <label key={x.id} className="cursor-pointer">
            <input type="radio" name="about_card_color" value={x.id} checked={color === x.id} onChange={() => onColor(x.id)} className="peer sr-only" />
            <span className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
              <span className="h-5 w-5 shrink-0 rounded-md border border-line" style={{ background: x.bg }} />
              {x.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
