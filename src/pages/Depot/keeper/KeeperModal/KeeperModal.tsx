import { ShieldCheck } from "lucide-react";
import type { Accounts } from "@/components/employees/EmployeeForms";
import { Modal } from "@/shared/components/Modal";
import { DHead } from "@/pages/Depot/components/ui";
import type { DepotEmployee } from "@/pages/Depot/utils";
import { StorekeepersCard } from "@/pages/Depot/keeper/StorekeepersCard";

// Başlıqdakı ⚙ → depo məsulu pəncərəsi (yalnız admin)
export function KeeperModal({ employees, accounts, selfId, onClose }: { employees: DepotEmployee[]; accounts: Accounts; selfId: number | null; onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="keeper-title" className="!max-w-md">
      <DHead id="keeper-title" icon={ShieldCheck} tone="violet" title="Depo məsulu" sub="Yalnız adminə görünür" onClose={onClose} />
      <StorekeepersCard employees={employees} accounts={accounts} selfId={selfId} />
    </Modal>
  );
}
