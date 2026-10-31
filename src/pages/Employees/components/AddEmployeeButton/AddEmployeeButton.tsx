import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { AddEmployeeForm } from "./AddEmployeeForm";

// "Yeni usta": başlıqdakı düymə pəncərə açır (Şirkətlər kimi), siyahı bütün eni tutur
export function AddEmployeeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="hero-action">
        <Plus size={17} /> Yeni usta
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-employee-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-tile !h-10 !w-10"><Plus size={18} /></span>
            <h2 id="add-employee-title" className="card-title">Yeni usta</h2>
          </div>
          <AddEmployeeForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
