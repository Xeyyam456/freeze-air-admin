
import { useLayoutEffect, useRef, useState } from "react";
import { rectOf, viewport } from "@/lib/zoom";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEscapeLayer } from "./Modal";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const WEEKDAYS = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"]; // həftə bazar ertəsindən

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function todayIso() {
  const t = new Date();
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
}

// "2026-10-16" → "16 oktyabr 2026"
export function formatDateAz(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return `${d} ${MONTHS[m - 1].toLocaleLowerCase("az")} ${y}`;
}

// Düymənin altında (yer yoxdursa üstündə) açılan qat. Portal ilə body-yə çıxır ki, modalın kənarında kəsilməsin.
function Popover({ anchorRef, onClose, children }: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEscapeLayer(onClose);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const place = () => {
      const a = rectOf(anchor);
      const h = ref.current?.offsetHeight ?? 0;
      const w = ref.current?.offsetWidth ?? 0;
      const below = a.bottom + 6 + h <= viewport().h;
      setPos({
        top: below ? a.bottom + 6 : Math.max(8, a.top - 6 - h),
        left: Math.min(a.left, viewport().w - w - 8),
      });
    };
    place();
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onCloseRef.current();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
      className="fixed z-[200] w-[296px] rounded-2xl border border-line bg-surface p-3 shadow-[0_16px_40px_rgba(16,24,40,0.18)]"
    >
      {children}
    </div>,
    document.body,
  );
}

function Trigger({ label, placeholder, open, onClick, buttonRef, small }: {
  label: string | null;
  placeholder: string;
  open: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  small?: boolean;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={`flex w-full items-center gap-2 rounded-[10px] border bg-surface px-3 text-left transition-colors ${
        small ? "h-9 text-[13px]" : "h-[42px] text-sm"
      } ${open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"}`}
    >
      <CalendarDays size={15} className="shrink-0 text-primary" />
      {label ? <span className="truncate font-semibold">{label}</span> : <span className="muted truncate">{placeholder}</span>}
    </button>
  );
}

const navBtn = "grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

// Gün seçimi ("YYYY-MM-DD").
// Formada: name + defaultValue (gizli <input> ilə göndərilir). Filtrdə: value + onChange (xaricdən idarə olunur).
export function DatePicker({ name, defaultValue, value: controlled, onChange, min, max, required, small, placeholder = "Tarix seç" }: {
  name?: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (v: string) => void;
  min?: string; // bundan əvvəlki günlər seçilmir (məs. tapşırıq: keçmiş günə verilmir)
  max?: string;
  required?: boolean;
  small?: boolean;
  placeholder?: string;
}) {
  const [inner, setInner] = useState<string>(defaultValue ?? "");
  const value = controlled ?? inner;
  const setValue = (v: string) => (onChange ? onChange(v) : setInner(v));
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const base = value || todayIso();
  const [view, setView] = useState(() => ({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 }));

  const today = todayIso();
  const first = new Date(view.y, view.m, 1);
  const offset = (first.getDay() + 6) % 7; // bazar ertəsi = 0
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const nextDisabled = !!max && iso(view.y, view.m + 1, 1) > max;
  const prevDisabled = !!min && iso(view.y, view.m, 1) <= min;

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
      <Trigger label={value ? formatDateAz(value) : null} placeholder={placeholder} open={open} small={small}
        onClick={() => {
          // Açılanda təqvim seçilmiş günün ayını göstərsin
          const b = value || todayIso();
          setView({ y: Number(b.slice(0, 4)), m: Number(b.slice(5, 7)) - 1 });
          setOpen((o) => !o);
        }}
        buttonRef={btnRef} />
      {open && (
        <Popover anchorRef={btnRef} onClose={() => setOpen(false)}>
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} disabled={prevDisabled} className={navBtn} aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold">{MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={() => shift(1)} disabled={nextDisabled} className={navBtn} aria-label="Növbəti ay"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => <span key={w} className="muted py-1 text-[11px] font-semibold">{w}</span>)}
            {cells.map((d, i) => {
              if (d === null) return <span key={`e${i}`} />;
              const v = iso(view.y, view.m, d);
              const disabled = (!!max && v > max) || (!!min && v < min);
              const selected = v === value;
              const isToday = v === today;
              return (
                <button key={v} type="button" disabled={disabled} onClick={() => pick(v)}
                  className={`h-9 rounded-lg text-[13px] font-medium transition-colors disabled:cursor-default disabled:opacity-25 ${
                    selected ? "bg-primary font-bold text-white shadow-sm"
                      : isToday ? "bg-primary-soft font-bold text-primary"
                      : "hover:bg-bg"
                  }`}>
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
            <button type="button" onClick={() => pick(today)} disabled={(!!max && today > max) || (!!min && today < min)} className="link text-[13px]">Bu gün</button>
            {!required && value && (
              <button type="button" onClick={() => pick("")} className="text-[13px] font-semibold text-danger hover:underline">Təmizlə</button>
            )}
          </div>
        </Popover>
      )}
    </>
  );
}
