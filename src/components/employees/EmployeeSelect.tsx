import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, UserRound } from "lucide-react";
import { useEscapeLayer } from "@/components/Modal";
import { Avatar } from "./EmployeeForms";

export type SelectableEmployee = { id: number; full_name: string; photo_url: string | null; specialty?: string | null };

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın
function norm(s: string | null | undefined) {
  return (s ?? "").toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

type Pos = { left: number; width: number; top?: number; bottom?: number; maxHeight: number };

// Usta seçimi: standart <select> əvəzinə şəkilli, axtarışlı açılan siyahı (UnitSelect quruluşu: portal ilə body-yə çıxır,
// yer yoxdursa yuxarı açılır, kənara klik / Esc / sürüşmə bağlayır). Klaviatura: ↑↓ seçir, Enter təsdiqləyir.
// emptyLabel verilərsə siyahının başında "heç kim" seçimi olur (dəyər null). hint: ustanın sağında kiçik yazı (məs. "2 tapşırıq").
export function EmployeeSelect({ value, onChange, employees, placeholder = "Usta seç...", emptyLabel, hint }: {
  value: number | null;
  onChange: (id: number | null) => void;
  employees: SelectableEmployee[];
  placeholder?: string;
  emptyLabel?: string;
  hint?: (id: number) => string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => setOpen(false), open);

  const showSearch = employees.length > 6;
  const options = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    const list: (SelectableEmployee | null)[] = employees.filter((e) => {
      const hay = norm(`${e.full_name} ${e.specialty ?? ""}`);
      return words.every((w) => hay.includes(w));
    });
    return emptyLabel && !query ? [null, ...list] : list;
  }, [employees, query, emptyLabel]);
  const selected = employees.find((e) => e.id === value) ?? null;

  function toggle() {
    if (open) return setOpen(false);
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => (o?.id ?? null) === value)));
    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const need = Math.min(employees.length + (emptyLabel ? 1 : 0), 7) * 52 + (showSearch ? 52 : 0) + 12;
    const below = window.innerHeight - r.bottom - 14;
    const above = r.top - 14;
    const down = below >= need || below >= above;
    setPos({
      left: r.left, width: Math.max(r.width, 280), maxHeight: Math.max(160, Math.min(need, down ? below : above)),
      ...(down ? { top: r.bottom + 6 } : { bottom: window.innerHeight - r.top + 6 }),
    });
  }, [open, employees.length, emptyLabel, showSearch]);

  // Kənara klik, səhifə sürüşməsi və ölçü dəyişməsi siyahını bağlayır (siyahının öz sürüşməsi yox)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    const onScroll = (e: Event) => { if (!listRef.current?.contains(e.target as Node)) setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  // Aktiv sətir görünən yerdə qalsın
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function pick(o: SelectableEmployee | null) {
    onChange(o?.id ?? null);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (!open) toggle(); else setActive((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && open) { e.preventDefault(); if (options[active] !== undefined) pick(options[active]); }
  }

  return (
    <>
      <button ref={btnRef} type="button" onClick={toggle} onKeyDown={onKey} aria-haspopup="listbox" aria-expanded={open}
        className={`field flex items-center gap-2.5 text-left ${open ? "!border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : ""}`}>
        {selected ? (
          <>
            <Avatar employee={selected} className="!h-7 !w-7 !text-[10px] !shadow-none" />
            <span className="min-w-0 flex-1 truncate font-semibold">{selected.full_name}</span>
          </>
        ) : (
          <>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg text-muted"><UserRound size={15} /></span>
            <span className="muted min-w-0 flex-1 truncate">{value === null && emptyLabel ? emptyLabel : placeholder}</span>
          </>
        )}
        <ChevronDown size={15} className={`muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && pos && createPortal(
        <div ref={listRef}
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
          className="z-[150] flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
              <Search size={15} className="muted shrink-0" />
              <input autoFocus value={query} onKeyDown={onKey} aria-label="Usta axtar" placeholder="Ad və ya ixtisas..."
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </div>
          )}
          <div role="listbox" className="nice-scroll min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-gutter:auto]">
            {options.length === 0 && <p className="muted px-3 py-4 text-center text-sm">Usta tapılmadı</p>}
            {options.map((o, i) => {
              const isSel = (o?.id ?? null) === value;
              const h = o && hint?.(o.id);
              return (
                <button key={o?.id ?? "none"} type="button" role="option" aria-selected={isSel} data-index={i}
                  onMouseEnter={() => setActive(i)} onClick={() => pick(o)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                    i === active ? "bg-bg" : ""} ${isSel ? "!bg-primary-soft" : ""}`}>
                  {o ? (
                    <Avatar employee={o} className="!h-9 !w-9 !text-[11px] !shadow-none" />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg text-muted"><UserRound size={16} /></span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${isSel ? "text-primary" : ""}`}>{o ? o.full_name : emptyLabel}</span>
                    {o?.specialty && <span className="muted block truncate text-xs">{o.specialty}</span>}
                  </span>
                  {h && <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted">{h}</span>}
                  {isSel ? <Check size={15} className="shrink-0 text-primary" /> : <span className="w-[15px] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
