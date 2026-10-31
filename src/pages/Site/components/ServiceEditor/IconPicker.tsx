import type { IconPickerProps } from "@/types/site";
import { SERVICE_ICONS } from "../../constants/serviceIcons";

export function IconPicker({ icon, onIcon }: IconPickerProps) {
  return (
    <div>
      <span className="label">İkon</span>
      <div className="grid grid-cols-5 gap-1.5">
        {SERVICE_ICONS.map(({ name, icon: Icon }) => (
          <button key={name} type="button" onClick={() => onIcon(name)} aria-label={name}
            className={`grid h-10 place-items-center rounded-xl border transition-colors ${
              icon === name ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:border-primary"
            }`}>
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
