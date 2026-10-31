import { useLayoutEffect, useState, type RefObject } from "react";
import { fitX, rectOf, viewport } from "@/lib/zoom";
import type { SelectPos } from "@/types/employees";

// Siyahının yeri: düymənin altında, yer yoxdursa yuxarıda; eni ekrandan çıxmır
export function useSelectPosition(open: boolean, btnRef: RefObject<HTMLButtonElement | null>, count: number, showSearch: boolean) {
  const [pos, setPos] = useState<SelectPos | null>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = rectOf(btnRef.current);
    const need = Math.min(count, 7) * (viewport().w < 640 ? 42 : 52) + (showSearch ? 52 : 0) + 12;
    const below = viewport().h - r.bottom - 14;
    const above = r.top - 14;
    const down = below >= need || below >= above;
    setPos({
      ...fitX(r.left, Math.max(r.width, viewport().w < 640 ? 230 : 280)), maxHeight: Math.max(160, Math.min(need, down ? below : above)),
      ...(down ? { top: r.bottom + 6 } : { bottom: viewport().h - r.top + 6 }),
    });
  }, [open, count, showSearch, btnRef]);

  return pos;
}
