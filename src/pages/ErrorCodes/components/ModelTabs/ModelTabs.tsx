import type { ModelTabsProps } from "@/types/errorCodes";
import { shortModelNames } from "../../utils/shortModelNames";
import s from "./ModelTabs.module.css";

// Kondisioner modeli: hər model öz düyməsi, yanında kod sayı. Ortaq marka ("Daikin") düymədə yazılmır, pult ekranında var.
export function ModelTabs({ models, counts, value, onChange }: ModelTabsProps) {
  const names = shortModelNames(models);
  return (
    <div className={s.root} role="tablist" aria-label="Kondisioner modeli">
      {models.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={m.id === value}
          title={m.name}
          className={`${s.tab} ${m.id === value ? s.active : ""}`}
          onClick={() => onChange(m.id)}
        >
          {names.get(m.id)}
          <span>{counts.get(m.id) ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
