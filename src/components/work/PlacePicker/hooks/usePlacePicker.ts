import { useEffect, useMemo, useRef, useState } from "react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import { norm } from "@/shared/utils/norm";
import type { Place, PlacePickerProps } from "@/types/workLogs";
import { customPlace, MAX_CUSTOM } from "../utils/place";

// Yer seçiminin vəziyyəti: açıq/bağlı, axtarış, süzülmüş qruplar, klaviatura ilə gəzmə, kənara klik
export function usePlacePicker({ places, onChange }: Pick<PlacePickerProps, "places" | "onChange">) {
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
  const options = useMemo(() => (trimmed ? [...filtered, customPlace(trimmed.slice(0, MAX_CUSTOM))] : filtered), [filtered, trimmed]);
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

  return { open, setOpen, query, setQuery, active, setActive, rootRef, inputRef, trimmed, filtered, options, groups, choose, onKeyDown };
}
