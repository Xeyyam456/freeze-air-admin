import { ShieldCheck } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { DHead } from "../../components/DHead";
import { StorekeepersCard } from "../StorekeepersCard";
import type { KeeperModalProps } from "@/types/storekeeper";

// Başlıqdakı ⚙ → depo məsulu pəncərəsi (yalnız admin)
export function KeeperModal({ employees, accounts, selfId, onClose }: KeeperModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="keeper-title" className="!max-w-md">
      <DHead id="keeper-title" icon={ShieldCheck} tone="violet" title="Depo məsulu" sub="Yalnız adminə görünür" onClose={onClose} />
      <StorekeepersCard employees={employees} accounts={accounts} selfId={selfId} />
    </Modal>
  );
}
