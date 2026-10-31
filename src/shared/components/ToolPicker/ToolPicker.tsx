import { Wrench } from "lucide-react";
import type { ToolPickerProps } from "@/types/shared";
import { PickerButton } from "./PickerButton";
import { ToolPickerMenu } from "./ToolPickerMenu";
import { useToolPicker } from "./useToolPicker";

// Axtarışlı seçim siyahısı (əsasən depodan alət, həm də usta seçimi): brauzerin standart siyahısı əvəzinə.
// Yuxarı açılır (mobildə ekranın ortasında); 5 sətir görünür (~212px), qalanı sürüşür. Seçim gizli sahə (`name`, standart "tool_id") ilə formaya gedir.
export function ToolPicker({
  items, value, onChange, name = "tool_id", icon: Icon = Wrench,
  placeholder = "Depodan alət seç...", emptyLabel = "Depoda boş alət yoxdur", searchLabel = "Alət axtar...",
}: ToolPickerProps) {
  const p = useToolPicker(items, value, onChange);

  return (
    <div ref={p.rootRef} className="relative min-w-0 flex-1" onKeyDown={p.onKeyDown}>
      <input type="hidden" name={name} value={value ?? ""} />
      <PickerButton selected={p.selected} open={p.open} empty={items.length === 0} icon={Icon} placeholder={placeholder}
        emptyLabel={emptyLabel} buttonRef={p.btnRef} onClick={p.toggle} />
      {p.open && (
        <ToolPickerMenu anchor={p.btnRef.current} items={p.filtered} value={value} active={p.active} query={p.query}
          searchRef={p.searchRef} icon={Icon} searchLabel={searchLabel} onActive={p.setActive} onQuery={p.setQuery}
          onChoose={p.choose} onClose={p.close} />
      )}
    </div>
  );
}
