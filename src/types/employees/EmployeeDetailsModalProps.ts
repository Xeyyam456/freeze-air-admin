import type { Accounts } from "./Accounts";
import type { Employee } from "./Employee";

export type EmployeeDetailsModalProps = { accounts: Accounts; employee: Employee; admin: boolean; onClose: () => void };
