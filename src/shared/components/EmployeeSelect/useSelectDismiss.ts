import { useEffect, type RefObject } from "react";

// Kənara klik, səhifə sürüşməsi və ölçü dəyişməsi siyahını bağlayır (siyahının öz sürüşməsi yox)
export function useSelectDismiss(
  open: boolean,
  setOpen: (v: boolean) => void,
  btnRef: RefObject<HTMLButtonElement | null>,
  listRef: RefObject<HTMLDivElement | null>,
) {
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
  }, [open, setOpen, btnRef, listRef]);
}
