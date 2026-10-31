import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { FileViewerProps } from "@/types/workLogs";

// İç-içə pəncərə: video oynadıcı, PDF (iframe) və ya şəkil
export function FileViewer({ file, onClose }: FileViewerProps) {
  return (
    <Modal onClose={onClose} labelledBy="work-file-title" className="!max-w-3xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="work-file-title" className="text-lg font-bold">{file.title}</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      {file.video
        ? <video src={file.url} controls autoPlay playsInline className="max-h-[75vh] w-full rounded-xl bg-black ring-1 ring-line" />
        : file.pdf
        ? <iframe src={file.url} title={file.title} className="h-[70vh] w-full rounded-xl border border-line" />
        : <img src={file.url} alt={file.title} className="max-h-[75vh] w-full rounded-xl object-contain ring-1 ring-line" />}
    </Modal>
  );
}
