import type { ManagerModalsProps } from "@/types/management";
import { ContactModal } from "../ContactModal";
import { EditManagerModal } from "../EditManagerModal";
import { ManagerDetailsModal } from "../ManagerDetailsModal";

// Kartın pəncərələri (məlumat, redaktə, telefon/şəkil): kartın çölündə render olunur ki, içlərindəki kliklər karta keçməsin
export function ManagerModals({ card, state }: ManagerModalsProps) {
  const { manager, accounts, canEdit } = card;
  return (
    <>
      {state.viewing && <ManagerDetailsModal manager={manager} accounts={accounts} canEdit={canEdit} onClose={state.close} />}
      {state.editing && <EditManagerModal manager={manager} onClose={state.close} />}
      {state.contact && <ContactModal manager={manager} onClose={state.close} />}
    </>
  );
}
