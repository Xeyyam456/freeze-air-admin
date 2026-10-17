
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Açıq qatların növbəsi (modal, təqvim, açılan siyahı): Esc yalnız ən üstdəkini bağlasın.
const stack: symbol[] = [];

export function useEscapeLayer(onClose: () => void, active = true) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;
    const id = Symbol("layer");
    stack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === id) onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(id), 1);
    };
  }, [active]);
}

type Props = {
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
};

// Ekranın ortasında açılan pəncərə: Esc və ya kənara klik bağlayır.
export function Modal({ onClose, labelledBy, className = "", children }: Props) {
  useEscapeLayer(onClose);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
