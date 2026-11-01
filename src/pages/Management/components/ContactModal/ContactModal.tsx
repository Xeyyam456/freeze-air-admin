import { IconButton } from "@/shared/components/IconButton";
import { X } from "lucide-react";
import { FormActions } from "@/shared/components/FormActions";
import { AvatarUpload } from "@/shared/components/AvatarUpload";
import { Modal } from "@/shared/components/Modal";
import type { ManagerModalProps } from "@/types/management";
import { useSavePhone } from "./useSavePhone";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

// Müdir olmayan rəhbər (və müdir öz kartında): yalnız telefon və şəkil
export function ContactModal(props: ManagerModalProps) {
  const { manager, onClose } = props;
  const { phone, setPhone, pending, save } = useSavePhone(props);

  return (
    <Modal onClose={onClose} labelledBy="contact-manager-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="contact-manager-title" className="text-lg font-bold">Telefon və şəkil</h2>
          <p className="muted text-sm">{manager.full_name}</p>
        </div>
        <IconButton onClick={onClose} aria-label="Bağla"><X size={18} /></IconButton>
      </div>
      <div className="mb-4"><AvatarUpload employee={manager} /></div>
      <form onSubmit={save} className="space-y-4">
        <FormField label="Telefon">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+994 50 000 00 00" />
        </FormField>
        <p className="muted text-xs">Ad, vəzifə və hesabı yalnız müdir dəyişir.</p>
        <FormActions pending={pending} label="Yadda saxla" onCancel={onClose} />
      </form>
    </Modal>
  );
}
