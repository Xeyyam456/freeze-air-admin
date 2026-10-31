import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { rectOf, viewport } from "@/lib/zoom";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { DatePopoverProps } from "@/types/shared";

// Düymənin altında (yer yoxdursa üstündə) açılan qat. Portal ilə body-yə çıxır ki, modalın kənarında kəsilməsin.
export function Popover({ anchorRef, onClose, children }: DatePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEscapeLayer(onClose);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const place = () => {
      const a = rectOf(anchor);
      const h = ref.current?.offsetHeight ?? 0;
      const w = ref.current?.offsetWidth ?? 0;
      const below = a.bottom + 6 + h <= viewport().h;
      setPos({
        top: below ? a.bottom + 6 : Math.max(8, a.top - 6 - h),
        left: Math.min(a.left, viewport().w - w - 8),
      });
    };
    place();
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onCloseRef.current();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
      className="fixed z-[200] w-[296px] rounded-2xl border border-line bg-surface p-3 shadow-[0_16px_40px_rgba(16,24,40,0.18)]"
    >
      {children}
    </div>,
    document.body,
  );
}
