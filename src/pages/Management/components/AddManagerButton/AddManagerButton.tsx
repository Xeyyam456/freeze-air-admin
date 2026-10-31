import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { AddManagerForm } from "./AddManagerForm";

// "Yeni rəhbər" (yalnız müdir): başlıqdakı düymə pəncərə açır, siyahı bütün eni tutur
export function AddManagerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hero-action">
        <Plus size={17} /> Yeni rəhbər
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-manager-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-tile !h-10 !w-10"><Plus size={18} /></span>
            <h2 id="add-manager-title" className="card-title">Yeni rəhbər</h2>
          </div>
          <AddManagerForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
