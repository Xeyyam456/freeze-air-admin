import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import { norm } from "@/shared/utils/norm";
import type { PickerItem } from "@/types/shared";

// Axtarışlı siyahının vəziyyəti: açıq/bağlı, axtarış, aktiv sətir, klaviatura (↑ ↓ Enter)
export function useToolPicker(items: PickerItem[], value: number | null, onChange: (id: number | null) => void) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  // Esc yalnız siyahını bağlasın, usta pəncərəsini yox (ümumi qat növbəsi)
  useEscapeLayer(close, open);

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

  function choose(item: PickerItem) {
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

  return {
    open, query, active, selected, filtered, rootRef, searchRef, btnRef, close, toggle, choose, onKeyDown, setActive,
    setQuery: (q: string) => { setQuery(q); setActive(0); },
  };
}
