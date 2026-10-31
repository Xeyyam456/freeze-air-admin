import type { DepotEmployee } from "@/types/depot";
import type { Accounts } from "@/types/employees";

export type StorekeepersCardProps = { employees: DepotEmployee[]; accounts: Accounts; selfId: number | null };
