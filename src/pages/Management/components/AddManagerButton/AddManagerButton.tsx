import { HeroAction } from "@/shared/components/HeroAction";
import { IconTile } from "@/shared/components/IconTile";
import { CardTitle } from "@/shared/components/Card";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { AddManagerForm } from "./AddManagerForm";

// "Yeni rəhbər" (yalnız müdir): başlıqdakı düymə pəncərə açır, siyahı bütün eni tutur
export function AddManagerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HeroAction onClick={() => setOpen(true)} >
        <Plus size={17} /> Yeni rəhbər
      </HeroAction>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-manager-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <IconTile className="!h-10 !w-10"><Plus size={18} /></IconTile>
            <CardTitle id="add-manager-title" >Yeni rəhbər</CardTitle>
          </div>
          <AddManagerForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
