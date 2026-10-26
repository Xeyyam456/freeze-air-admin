
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronUp, PackageOpen, Search, Wrench, type LucideIcon } from "lucide-react";
import { useEscapeLayer } from "./Modal";

type Item = { id: number; name: string; hint?: string };

function norm(s: string) {
  return s.toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Axtarışlı seçim siyahısı (əsasən depodan alət, həm də usta seçimi): brauzerin standart siyahısı əvəzinə.
// Pəncərənin aşağısında durduğu üçün yuxarı açılır. Seçim gizli sahə (`name`, standart "tool_id") ilə formaya gedir.
// hint: sağda kiçik yazı (məs. "depoda 3").
export function ToolPicker({
  items, value, onChange, name = "tool_id", icon: Icon = Wrench,
  placeholder = "Depodan alət seç...", emptyLabel = "Depoda boş alət yoxdur", searchLabel = "Alət axtar...",
}: {
  items: Item[];
  value: number | null;
  onChange: (id: number | null) => void;
  name?: string;
  icon?: LucideIcon;
  placeholder?: string;
  emptyLabel?: string;
  searchLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Esc yalnız siyahını bağlasın, usta pəncərəsini yox (ümumi qat növbəsi)
  useEscapeLayer(() => setOpen(false), open);

  const selected = items.find((i) => i.id === value) ?? null;
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return q ? items.filter((i) => norm(i.name).includes(q)) : items;
  }, [items, query]);

  // Kənara klikləyəndə bağlanır
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    searchRef.current?.focus();
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle() {
    setQuery("");
    setActive(0);
    setOpen((o) => !o);
  }

  function choose(item: Item) {
    onChange(item.id);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    }
  }

  const empty = items.length === 0;

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1" onKeyDown={onKeyDown}>
      <input type="hidden" name={name} value={value ?? ""} />
      <button
        type="button"
        onClick={toggle}
        disabled={empty}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-9 w-full items-center gap-2 rounded-[10px] border bg-surface px-3 text-left text-[13px] transition-colors disabled:opacity-60 ${
          open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"
        }`}
      >
        {selected ? (
          <>
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><Icon size={12} /></span>
            <span className="truncate font-semibold">{selected.name}</span>
            {selected.hint && <span className="muted shrink-0 text-[11px] font-semibold">{selected.hint}</span>}
          </>
        ) : (
          <span className="muted truncate">{empty ? emptyLabel : placeholder}</span>
        )}
        <ChevronUp size={15} className={`muted ml-auto shrink-0 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-20 max-sm:right-auto max-sm:w-[min(18rem,calc(100vw-5rem))] mb-2 max-sm:mb-1.5 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search size={14} className="muted shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              placeholder={searchLabel}
              className="h-10 w-full bg-transparent text-[13px] outline-none"
              aria-label={searchLabel}
            />
            <span className="muted shrink-0 text-xs">{filtered.length}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-3 py-5 text-center">
              <PackageOpen size={18} className="muted" />
              <p className="muted text-xs">Bu adla heç nə tapılmadı</p>
            </div>
          ) : (
            <ul role="listbox" className="nice-scroll max-h-56 max-sm:max-h-32 overflow-y-auto p-1.5">
              {filtered.map((item, i) => {
                const isSelected = item.id === value;
                return (
                  <li key={item.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(item)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
                        i === active ? "bg-primary-soft text-primary" : "hover:bg-bg"
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${i === active ? "bg-surface" : "bg-bg"} text-primary`}>
                        <Icon size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.name}</span>
                        {item.hint && <span className="muted hidden text-[10.5px] font-semibold leading-tight max-sm:block">{item.hint}</span>}
                      </span>
                      {item.hint && <span className="muted shrink-0 text-[11px] font-semibold max-sm:hidden">{item.hint}</span>}
                      {isSelected && <Check size={15} className="shrink-0 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
