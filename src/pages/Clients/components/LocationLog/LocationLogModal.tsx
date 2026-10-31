import { MapPinned, X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { LocationLogModalProps } from "@/types/clients";
import { LocationLogItem } from "./LocationLogItem";

export function LocationLogModal({ logs, unitOf, onClose }: LocationLogModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="loc-log-title" className="flex !max-w-2xl flex-col">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="loc-log-title" className="flex items-center gap-2 text-lg font-bold"><MapPinned size={18} className="text-primary" /> Konum dəyişiklikləri</h2>
          <p className="muted text-xs">Ustanın "Konumu düzəlt" ilə dəyişdiyi ünvan və koordinatlar · {logs.length} qeyd</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <ul className="nice-scroll -mr-2 max-h-[min(560px,calc(100dvh/var(--zoom)-200px))] space-y-2 overflow-y-auto pr-2">
        {logs.map((l) => (
          <LocationLogItem key={l.id} log={l} unit={l.place_kind === "store" ? unitOf.get(l.place_id) ?? null : null} />
        ))}
      </ul>
    </Modal>
  );
}
