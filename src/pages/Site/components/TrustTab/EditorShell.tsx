import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { EditorShellProps } from "@/types/site";

export function EditorShell({ title, onClose, onSubmit, pending, children, wide = false }: EditorShellProps) {
  return (
    <Modal onClose={onClose} labelledBy="trust-editor-title" className={wide ? "!max-w-2xl !p-6" : "!max-w-md !p-6"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="trust-editor-title" className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
        {children}
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary min-w-36">{pending ? "Gözləyin..." : "Yadda saxla"}</button>
        </div>
      </form>
    </Modal>
  );
}
