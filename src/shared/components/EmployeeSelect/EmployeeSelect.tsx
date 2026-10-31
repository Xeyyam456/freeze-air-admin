import type { EmployeeSelectProps } from "@/types/employees";
import { EmployeeSelectPopup } from "./EmployeeSelectPopup";
import { EmployeeSelectTrigger } from "./EmployeeSelectTrigger";
import { useEmployeeSelect } from "./useEmployeeSelect";

// Usta seçimi: standart <select> əvəzinə şəkilli, axtarışlı açılan siyahı (UnitSelect quruluşu: portal ilə body-yə çıxır,
// yer yoxdursa yuxarı açılır, kənara klik / Esc / sürüşmə bağlayır). Klaviatura: ↑↓ seçir, Enter təsdiqləyir.
// emptyLabel verilərsə siyahının başında "heç kim" seçimi olur (dəyər null). hint: ustanın sağında kiçik yazı (məs. "2 tapşırıq").
export function EmployeeSelect({ value, onChange, employees, placeholder = "Usta seç...", emptyLabel, hint }: EmployeeSelectProps) {
  const s = useEmployeeSelect({ value, onChange, employees, emptyLabel });

  return (
    <>
      <EmployeeSelectTrigger selected={s.selected} value={value} placeholder={placeholder} emptyLabel={emptyLabel}
        open={s.open} btnRef={s.btnRef} onToggle={s.toggle} onKey={s.onKey} />
      {s.open && s.pos && (
        <EmployeeSelectPopup pos={s.pos} listRef={s.listRef} showSearch={s.showSearch} query={s.query} options={s.options}
          value={value} active={s.active} emptyLabel={emptyLabel} hint={hint} onSearch={s.onSearch} onKey={s.onKey}
          onHover={s.setActive} onPick={s.pick} />
      )}
    </>
  );
}
