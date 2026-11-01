import { HeroAction } from "@/shared/components/HeroAction";
import { IconTile } from "@/shared/components/IconTile";
import { CardTitle } from "@/shared/components/Card";
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
      <HeroAction onClick={() => setOpen(true)} >
        <Plus size={17} /> Yeni {KIND[kind].one}
      </HeroAction>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="add-client-title" className="!max-w-lg">
          <div className="mb-5 flex items-center gap-3">
            <IconTile className="!h-10 !w-10"><Plus size={18} /></IconTile>
            <CardTitle id="add-client-title" >Yeni {KIND[kind].one}</CardTitle>
          </div>
          <AddClientForm kind={kind} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
