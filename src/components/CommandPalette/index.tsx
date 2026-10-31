import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { CommandPaletteProps } from "@/types/layout";
import { PaletteRow } from "./components/PaletteRow";
import { useCommandPalette } from "./hooks/useCommandPalette";

// Ctrl+K axtarışı: şirkət, mağaza, usta, alət və bölmələr
export function CommandPalette({ onClose }: CommandPaletteProps) {
  const p = useCommandPalette(onClose);
  useEscapeLayer(onClose);

  let lastGroup = "";
  return createPortal(
    <div className="modal-backdrop !items-start pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Axtarış">
        <label className="cmdk-input">
          <Search size={19} />
          <input autoFocus value={p.query} onKeyDown={p.onKey} onChange={(e) => p.setQuery(e.target.value)}
            placeholder="Şirkət, mağaza, usta, alət və ya bölmə axtar..." />
          <kbd>Esc</kbd>
        </label>
        <div ref={p.listRef} className="cmdk-list nice-scroll">
          {p.query && p.items === null && <p className="muted px-4 py-6 text-center text-sm">Yüklənir...</p>}
          {p.query && p.items !== null && !p.results.length && (
            <p className="muted px-4 py-6 text-center text-sm">“{p.query}” üzrə heç nə tapılmadı</p>
          )}
          {p.results.map((i, idx) => {
            const head = i.group !== lastGroup ? (lastGroup = i.group) : null;
            return <PaletteRow key={i.key} item={i} index={idx} active={idx === p.active} head={head} onHover={p.setActive} onOpen={p.open} />;
          })}
        </div>
        <p className="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> seç</span>
          <span><kbd>Enter</kbd> aç</span>
          <span><kbd>Ctrl</kbd><kbd>K</kbd> istənilən yerdən</span>
        </p>
      </div>
    </div>,
    document.body,
  );
}
