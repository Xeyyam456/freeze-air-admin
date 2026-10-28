import { createPortal } from "react-dom";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { ModalProps } from "@/types/shared";

// Ekranın ortasında açılan pəncərə: Esc və ya kənara klik bağlayır.
export function Modal({ onClose, labelledBy, className = "", children }: ModalProps) {
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
