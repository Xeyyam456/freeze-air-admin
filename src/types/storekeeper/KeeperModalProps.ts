import type { DepotEmployee } from "@/types/depot";
import type { Accounts } from "@/components/employees/EmployeeForms";

export type KeeperModalProps = { employees: DepotEmployee[]; accounts: Accounts; selfId: number | null; onClose: () => void };
