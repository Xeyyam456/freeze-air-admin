import type { Accounts, Employee } from "@/types/employees";

// canEdit: sahibdir; myUserId: öz kartı tam redaktə olunmur (özünü silib idarəsiz qalmasın);
// canContact: istənilən rəhbər (admin) telefon və şəkli dəyişir (0069)
export type ManagerListProps = {
  managers: Employee[];
  accounts: Accounts;
  canEdit: boolean;
  canContact?: boolean;
  myUserId: string | null;
};
