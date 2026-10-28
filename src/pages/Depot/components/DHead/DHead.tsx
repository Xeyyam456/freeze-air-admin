import { X } from "lucide-react";
import type { DHeadProps } from "@/types/depot";
import { IconTile } from "../IconTile";

// Pəncərə başlığı: modalın üst hissəsini tam endə tutur (yumşaq fon, rəngli ikon, başlıq, alt yazı, sağda düymələr + bağla).
// Modalın standart 24px daxili boşluğuna görə mənfi kənar boşluqlar.
// flush: daxili boşluğu olmayan pəncərədə (!p-0) mənfi kənar boşluqlar lazım deyil
export function DHead({ id, icon, tone, title, sub, onClose, children, flush = false }: DHeadProps) {
  return (
    <div className={`${flush ? "" : "-mx-6 -mt-6 max-sm:-mx-4 max-sm:-mt-5 mb-5 "}flex items-center gap-3.5 rounded-t-[18px] border-b border-line bg-[linear-gradient(180deg,#f7f9fd,#ffffff)] px-6 max-sm:px-4 py-4`}>
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <h2 id={id} className="truncate text-[17px] font-bold leading-tight tracking-[-0.01em] max-sm:line-clamp-2 max-sm:whitespace-normal max-sm:text-[15px]">{title}</h2>
        {sub && <div className="muted mt-0.5 truncate text-[13px] max-sm:!whitespace-normal max-sm:line-clamp-2 max-sm:text-xs max-sm:leading-snug">{sub}</div>}
      </div>
      {children}
      <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
    </div>
  );
}
