import type { ModelTabsProps } from "@/types/errorCodes";
import s from "./ModelTabs.module.css";

// Kondisioner modeli: hər model öz düyməsi, yanında kod sayı
export function ModelTabs({ models, counts, value, onChange }: ModelTabsProps) {
  return (
    <div className={s.root} role="tablist" aria-label="Kondisioner modeli">
      {models.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={m.id === value}
          className={`${s.tab} ${m.id === value ? s.active : ""}`}
          onClick={() => onChange(m.id)}
        >
          {m.name}
          <span>{counts.get(m.id) ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
