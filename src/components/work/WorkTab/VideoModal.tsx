import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { VideoModalProps } from "@/types/workLogs";

// İşin videosu pəncərədə oynayır
export function VideoModal({ url, onClose }: VideoModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="work-video-title" className="!max-w-3xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="work-video-title" className="text-lg font-bold">İşin videosu</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <video src={url} controls autoPlay playsInline className="max-h-[75vh] w-full rounded-xl bg-black ring-1 ring-line" />
    </Modal>
  );
}
