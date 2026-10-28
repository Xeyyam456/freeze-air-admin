
import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, ChevronDown, Home, MapPin, PenLine, Search, Store, X } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";

// İşin görüldüyü yer: mağaza/filial, filialı olmayan sabit məkanlı şirkət və ya siyahıda olmayan yer (mətn)
export type Place = {
  key: string;
  storeId: number | null;
  companyId: number | null;
  custom: string | null;
  group: string;
  label: string;
  sub: string;
  search: string;
};

export function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

export function customPlace(text: string): Place {
  const t = text.trim();
  return { key: `t:${t}`, storeId: null, companyId: null, custom: t, group: "", label: t, sub: "Siyahıda olmayan yer", search: "" };
}

const FIXED_GROUP = "Sabit məkanlar";
const MAX_CUSTOM = 120;

function GroupIcon({ group }: { group: string }) {
  if (group === FIXED_GROUP) return <Building2 size={13} />;
  return <Store size={13} />;
}

// Yer seçimi: kliklə bütün siyahı qruplarla açılır, yazdıqca süzülür.
// Uyğun yer yoxdursa, yazılan mətn özü yer kimi saxlanır (məs. "Fərdi ev").
export function PlacePicker({ places, value, onChange }: {
  places: Place[];
  value: Place | null;
  onChange: (p: Place | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscapeLayer(() => setOpen(false), open);

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    const words = norm(trimmed).split(/\s+/).filter(Boolean);
    return words.length ? places.filter((p) => words.every((w) => p.search.includes(w))) : places;
  }, [places, trimmed]);

  // Seçimlər ardıcıllığı (klaviatura üçün): süzülmüş yerlər + sonda "mətn kimi yaz"
  const options = useMemo(
    () => (trimmed ? [...filtered, customPlace(trimmed.slice(0, MAX_CUSTOM))] : filtered),
    [filtered, trimmed],
  );

  // Qruplar: sabit məkanlar, sonra şəbəkələr əlifba ilə
  const groups = useMemo(() => {
    const map = new Map<string, Place[]>();
    for (const p of filtered) (map.get(p.group) ?? map.set(p.group, []).get(p.group)!).push(p);
    return [...map.entries()];
  }, [filtered]);

  // Kənara klik bağlayır
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Klaviatura ilə gəzəndə aktiv sətir görünən sahədə qalsın (siçanla gəzəndə siyahı sürüşməsin)
  function moveTo(i: number) {
    setActive(i);
    requestAnimationFrame(() =>
      rootRef.current?.querySelector(`[data-index="${i}"]`)?.scrollIntoView({ block: "nearest" }));
  }

  function choose(p: Place) {
    onChange(p);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      moveTo(Math.min(active + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveTo(Math.max(active - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault(); // formanı göndərməsin
      if (open && options[active]) choose(options[active]);
    }
  }

  if (value) {
    const Icon = value.custom ? Home : MapPin;
    return (
      <div className="flex items-center gap-3 rounded-[10px] border border-primary bg-primary-soft px-3 py-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-primary"><Icon size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{value.label}</span>
          {value.sub && <span className="muted block truncate text-xs">{value.sub}</span>}
        </span>
        <button type="button" onClick={() => { onChange(null); setTimeout(() => inputRef.current?.focus()); }}
          className="icon-btn !h-7 !w-7" aria-label="Yeri dəyiş" title="Yeri dəyiş"><X size={14} /></button>
      </div>
    );
  }

  let index = -1; // qruplar boyu ümumi sıra nömrəsi
  return (
    <div ref={rootRef} className="relative">
      <div className={`flex h-[42px] items-center gap-2 rounded-[10px] border bg-surface px-3 transition-colors ${
        open ? "border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : "border-line hover:border-[#cfd5e1]"
      }`}>
        <Search size={16} className="muted shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          maxLength={MAX_CUSTOM}
          placeholder="Mağaza kodu, adı və ya yer yaz: məs. oba 015, fərdi ev"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          role="combobox"
          aria-expanded={open}
          aria-controls="place-list"
          aria-label="İş yeri"
        />
        <button type="button" tabIndex={-1} onClick={() => { setOpen((o) => !o); inputRef.current?.focus(); }}
          className="muted shrink-0" aria-label="Siyahını aç">
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          <div id="place-list" role="listbox" className="max-h-64 overflow-y-auto px-1.5 pb-1">
            {places.length === 0 && <p className="muted px-3 py-4 text-center text-sm">Yüklənir...</p>}

            {groups.map(([group, items]) => (
              <div key={group} className="pb-1">
                <p className="sticky top-0 z-10 -mx-1.5 flex items-center gap-1.5 border-b border-line bg-[#f8f9fc] px-4 py-1.5 text-[11px] font-bold text-muted">
                  <GroupIcon group={group} /> {group}
                  <span className="ml-auto font-medium">{items.length}</span>
                </p>
                {items.map((p) => {
                  index += 1;
                  const i = index;
                  return (
                    <button key={p.key} type="button" role="option" aria-selected={i === active} data-index={i}
                      onMouseEnter={() => setActive(i)} onClick={() => choose(p)}
                      className={`mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                        i === active ? "bg-primary-soft" : ""
                      }`}>
                      <span className={`min-w-0 flex-1 ${i === active ? "text-primary" : ""}`}>
                        <span className="block truncate text-[13px] font-semibold">{p.label}</span>
                        {p.sub && <span className="muted block truncate text-xs">{p.sub}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            {trimmed && filtered.length === 0 && (
              <p className="muted px-3 pb-1 pt-3 text-center text-xs">Siyahıda “{trimmed}” tapılmadı.</p>
            )}
          </div>

          {/* Siyahıda olmayan yer: yazılan mətn yer kimi saxlanır */}
          {trimmed && (() => {
            const i = options.length - 1;
            return (
              <button type="button" data-index={i} onMouseEnter={() => setActive(i)}
                onClick={() => choose(options[i])}
                className={`flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left transition-colors ${
                  i === active ? "bg-primary-soft" : "hover:bg-bg"
                }`}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><PenLine size={14} /></span>
                <span className="min-w-0 flex-1 text-[13px]">
                  <span className="block truncate font-semibold">“{trimmed}”</span>
                  <span className="muted block text-xs">Siyahıda olmayan yer kimi yaz</span>
                </span>
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
}
