import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { rectOf, viewport } from "@/lib/zoom";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { DropdownPos } from "@/types/tasks";

// Briqada siyahısının açılması (EmployeeSelect quruluşu): portal yeri, yer yoxdursa yuxarı; kənara klik / Esc / ölçü / sürüşmə bağlayır
export function useCrewDropdown(count: number) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => setOpen(false), open);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = rectOf(btnRef.current);
    const need = Math.min(count, 5) * 52 + 56;
    const below = viewport().h - r.bottom - 14;
    const above = r.top - 14;
    const down = below >= need || below >= above;
    setPos({ left: r.left, width: r.width, maxHeight: Math.max(150, Math.min(need, down ? below : above)),
      ...(down ? { top: r.bottom + 6 } : { bottom: viewport().h - r.top + 6 }) });
  }, [open, count]);

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

  return { open, setOpen, pos, btnRef, listRef };
}
