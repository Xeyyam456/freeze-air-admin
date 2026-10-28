import type { DepotEmployee } from "@/types/depot";
import type { Accounts } from "@/components/employees/EmployeeForms";

export type StorekeepersCardProps = { employees: DepotEmployee[]; accounts: Accounts; selfId: number | null };
