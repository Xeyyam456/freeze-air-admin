import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { LightboxProps } from "@/types/feed";

const BTN = "absolute grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25";

// Tam ekran şəkil baxışı: ← → düymələri və ya klaviatura oxları ilə növbətiyə keç, Esc və ya kənara klik bağlayır
export function Lightbox({ images, start, onClose }: LightboxProps) {
  const [i, setI] = useState(start);
  const n = images.length;
  useEscapeLayer(onClose);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
      if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [n]);

  return createPortal(
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/90" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      {/* eslint-disable-next-line @next/next/no-img-element -- imzalı storage linki */}
      <img src={images[i]} alt="" className="max-h-[92dvh] max-w-[94vw] object-contain" />
      <button type="button" onClick={onClose} className={`${BTN} right-4 top-4`} aria-label="Bağla"><X size={20} /></button>
      {n > 1 && (
        <>
          <button type="button" onClick={() => setI((x) => (x - 1 + n) % n)} className={`${BTN} left-4 top-1/2 -translate-y-1/2`} aria-label="Əvvəlki"><ChevronLeft size={22} /></button>
          <button type="button" onClick={() => setI((x) => (x + 1) % n)} className={`${BTN} right-4 top-1/2 -translate-y-1/2`} aria-label="Növbəti"><ChevronRight size={22} /></button>
          <span className="absolute bottom-5 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white">{i + 1} / {n}</span>
        </>
      )}
    </div>,
    document.body,
  );
}
