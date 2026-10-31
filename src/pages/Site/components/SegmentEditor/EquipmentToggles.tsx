import type { EquipmentTogglesProps } from "@/types/site";

// Obyektə bağlı tipik avadanlıq: çiplərlə seçim
export function EquipmentToggles({ options, selected, onToggle }: EquipmentTogglesProps) {
  return (
    <div>
      <span className="label">Tipik avadanlıq</span>
      <div className="flex flex-wrap gap-1.5">
        {options.length === 0 && <span className="muted text-xs">Əvvəlcə “Avadanlıq” tabında avadanlıq əlavə edin.</span>}
        {options.map((o) => {
          const on = selected.includes(o.key);
          return (
            <button key={o.key} type="button" onClick={() => onToggle(o.key)}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                on ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-primary"
              }`}>
              {o.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
