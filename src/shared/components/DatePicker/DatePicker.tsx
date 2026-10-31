import { useRef, useState } from "react";
import { formatDateAz } from "@/shared/utils/formatDateAz";
import { localDate } from "@/shared/utils/localDate";
import type { CalendarView, DatePickerProps } from "@/types/shared";
import { Calendar } from "./Calendar";
import { Popover } from "./Popover";
import { Trigger } from "./Trigger";

const viewOf = (v: string): CalendarView => ({ y: Number(v.slice(0, 4)), m: Number(v.slice(5, 7)) - 1 });

// Gün seçimi ("YYYY-MM-DD").
// Formada: name + defaultValue (gizli <input> ilə göndərilir). Filtrdə: value + onChange (xaricdən idarə olunur).
export function DatePicker({ name, defaultValue, value: controlled, onChange, min, max, required, small, placeholder = "Tarix seç" }: DatePickerProps) {
  const [inner, setInner] = useState<string>(defaultValue ?? "");
  const value = controlled ?? inner;
  const setValue = (v: string) => (onChange ? onChange(v) : setInner(v));
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState(() => viewOf(value || localDate()));

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  function pick(v: string) {
    setValue(v);
    setOpen(false);
    btnRef.current?.focus();
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <Trigger label={value ? formatDateAz(value) : null} placeholder={placeholder} open={open} small={small} buttonRef={btnRef}
        onClick={() => {
          // Açılanda təqvim seçilmiş günün ayını göstərsin
          setView(viewOf(value || localDate()));
          setOpen((o) => !o);
        }} />
      {open && (
        <Popover anchorRef={btnRef} onClose={() => setOpen(false)}>
          <Calendar view={view} value={value} min={min} max={max} required={required} onShift={shift} onPick={pick} />
        </Popover>
      )}
    </>
  );
}
