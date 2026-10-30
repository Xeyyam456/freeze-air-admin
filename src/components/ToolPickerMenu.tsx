import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Check, PackageOpen, Search, type LucideIcon } from "lucide-react";
import { fitX, rectOf, viewport } from "@/lib/zoom";

type Item = { id: number; name: string; hint?: string };

// ToolPicker-in açılan siyahısı (axtarış + 5 sətir görünən sürüşən siyahı). Portal ilə body-yə çıxır (fixed): dar pəncərənin
// içində kəsilməsin. Masaüstündə düymənin altında (yer yoxdursa üstündə), mobildə ekranın ortasında açılır.
export function ToolPickerMenu({ anchor, items, value, active, query, searchRef, icon: Icon, searchLabel, onActive, onQuery, onChoose, onClose }: {
  anchor: HTMLElement | null;
  items: Item[];
  value: number | null;
  active: number;
  query: string;
  searchRef: RefObject<HTMLInputElement | null>;
  icon: LucideIcon;
  searchLabel: string;
  onActive: (i: number) => void;
  onQuery: (q: string) => void;
  onChoose: (item: Item) => void;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return;
    const r = rectOf(anchor);
    const { w: vw, h: vh } = viewport();
    if (vw < 640) {
      setStyle({ left: vw / 2, top: vh / 2, width: Math.min(320, vw - 48), transform: "translate(-50%, -50%)" });
      return;
    }
    const { left, width } = fitX(r.left, Math.min(Math.max(r.width, 240), 360));
    setStyle(vh - r.bottom >= 290 || vh - r.bottom >= r.top ? { left, width, top: r.bottom + 6 } : { left, width, bottom: vh - r.top + 6 });
  }, [anchor]);

  // Arxa plan sürüşəndə və ya pəncərə ölçüsü dəyişəndə bağlanır (siyahının öz sürüşməsi istisna)
  useEffect(() => {
    const onScroll = (e: Event) => { if (!(e.target as Element | null)?.closest?.("[data-picker-menu]")) onClose(); };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    return () => { window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onClose); };
  }, [onClose]);

  if (!style) return null;
  return createPortal(
    <div data-picker-menu style={style} className="fixed z-[120] overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
      <div className="flex items-center gap-2 border-b border-line px-3">
        <Search size={14} className="muted shrink-0" />
        <input ref={searchRef} value={query} onChange={(e) => onQuery(e.target.value)} placeholder={searchLabel} aria-label={searchLabel}
          className="h-10 w-full bg-transparent text-[13px] outline-none max-sm:h-8 max-sm:text-xs" />
        <span className="muted shrink-0 text-xs">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-1 px-3 py-5 text-center">
          <PackageOpen size={18} className="muted" />
          <p className="muted text-xs">Bu adla heç nə tapılmadı</p>
        </div>
      ) : (
        <ul role="listbox" className="nice-scroll max-h-[212px] overflow-y-auto p-1.5">
          {items.map((item, i) => (
            <li key={item.id} role="option" aria-selected={item.id === value}>
              <button type="button" onMouseEnter={() => onActive(i)} onClick={() => onChoose(item)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${i === active ? "bg-primary-soft text-primary" : "hover:bg-bg"}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${i === active ? "bg-surface" : "bg-bg"} text-primary`}><Icon size={13} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{item.name}</span>
                  {item.hint && <span className="muted hidden text-[10.5px] font-semibold leading-tight max-sm:block">{item.hint}</span>}
                </span>
                {item.hint && <span className="muted shrink-0 text-[11px] font-semibold max-sm:hidden">{item.hint}</span>}
                {item.id === value && <Check size={15} className="shrink-0 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body,
  );
}
