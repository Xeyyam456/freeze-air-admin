
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, Wrench, type LucideIcon } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import { ToolPickerMenu } from "./ToolPickerMenu";

type Item = { id: number; name: string; hint?: string };

function norm(s: string) {
  return s.toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Axtarışlı seçim siyahısı (əsasən depodan alət, həm də usta seçimi): brauzerin standart siyahısı əvəzinə.
// Yuxarı açılır (mobildə ekranın ortasında); 5 sətir görünür (~212px), qalanı sürüşür. Seçim gizli sahə (`name`, standart "tool_id") ilə formaya gedir.
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

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
      const t = e.target as Element;
      if (!rootRef.current?.contains(t) && !t.closest("[data-picker-menu]")) setOpen(false);
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
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={empty}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-9 max-sm:h-7 w-full items-center gap-2 rounded-[10px] border bg-surface px-3 text-left text-[13px] transition-colors disabled:opacity-60 ${
          open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"
        }`}
      >
        {selected ? (
          <>
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary-soft text-primary"><Icon size={12} /></span>
            <span className="truncate font-semibold">{selected.name}</span>
            {selected.hint && <span className="muted shrink-0 text-[11px] font-semibold max-sm:hidden">{selected.hint}</span>}
          </>
        ) : (
          <span className="muted truncate">{empty ? emptyLabel : placeholder}</span>
        )}
        <ChevronUp size={15} className={`muted ml-auto shrink-0 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>

      {open && (
        <ToolPickerMenu anchor={btnRef.current} items={filtered} value={value} active={active} query={query} searchRef={searchRef} icon={Icon} searchLabel={searchLabel}
          onActive={setActive} onQuery={(q) => { setQuery(q); setActive(0); }} onChoose={choose} onClose={close} />
      )}
    </div>
  );
}
