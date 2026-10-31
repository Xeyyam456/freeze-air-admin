import { useState } from "react";
import { Plus } from "lucide-react";
import { KIND } from "@/lib/kinds";
import { Modal } from "@/shared/components/Modal";
import type { AddClientProps } from "@/types/clients";
import { AddClientForm } from "./AddClientForm";

// "Yeni şirkət" / "Yeni market": başlıqdakı düymə pəncərə açır, siyahı bütün eni tutur
export function AddClientButton({ kind }: AddClientProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hero-action">
        <Plus size={17} /> Yeni {KIND[kind].one}
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-client-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-tile !h-10 !w-10"><Plus size={18} /></span>
            <h2 id="add-client-title" className="card-title">Yeni {KIND[kind].one}</h2>
          </div>
          <AddClientForm kind={kind} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
