import { iconTileClass } from "@/shared/components/IconTile";
import { heroActionClass } from "@/shared/components/HeroAction";
import { CardTitle } from "@/shared/components/Card";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { AddEmployeeForm } from "./AddEmployeeForm";

// "Yeni usta": başlıqdakı düymə pəncərə açır (Şirkətlər kimi), siyahı bütün eni tutur
export function AddEmployeeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={heroActionClass()}>
        <Plus size={17} /> Yeni usta
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-employee-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className={iconTileClass("!h-10 !w-10")}><Plus size={18} /></span>
            <CardTitle id="add-employee-title" >Yeni usta</CardTitle>
          </div>
          <AddEmployeeForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
