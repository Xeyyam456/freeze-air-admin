import { useEffect, useLayoutEffect, useState } from "react";
import { fitX, rectOf, viewport } from "@/lib/zoom";

// Masaüstündə düymənin altında (yer yoxdursa üstündə), mobildə ekranın ortasında; arxa plan sürüşəndə bağlanır
export function useMenuPosition(anchor: HTMLElement | null, onClose: () => void) {
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

  // Siyahının öz sürüşməsi istisna
  useEffect(() => {
    const onScroll = (e: Event) => { if (!(e.target as Element | null)?.closest?.("[data-picker-menu]")) onClose(); };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    return () => { window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onClose); };
  }, [onClose]);

  return style;
}
