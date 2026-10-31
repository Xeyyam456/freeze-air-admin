import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { loadSearchItems } from "@/services/search/loadSearchItems";
import { norm } from "@/shared/utils/norm";
import type { PaletteItem } from "@/types/layout";
import { NAV_ITEMS } from "@/components/Sidebar/utils/navGroups";

const PAGES: PaletteItem[] = NAV_ITEMS.filter((n) => !n.ownerOnly).map((n) => ({ key: `p${n.href}`, group: "Bölmələr", label: n.label, icon: n.icon, href: n.href }));
const LIMIT = 40;

// Axtarış paneli: söz-söz süzgəc (boşdursa yalnız bölmələr), ↑↓ / Enter klaviaturası
export function useCommandPalette(onClose: () => void) {
  const navigate = useNavigate();
  const [items, setItems] = useState<PaletteItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSearchItems().then(setItems);
  }, []);

  const results = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return PAGES;
    return [...PAGES, ...(items ?? [])].filter((i) => {
      const hay = norm(`${i.label} ${i.hint ?? ""}`);
      return words.every((w) => hay.includes(w));
    }).slice(0, LIMIT);
  }, [query, items]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const open = (i: PaletteItem) => {
    onClose();
    navigate(i.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      open(results[active]);
    }
  };

  return { items, query, setQuery: (v: string) => { setQuery(v); setActive(0); }, active, setActive, listRef, results, open, onKey };
}
