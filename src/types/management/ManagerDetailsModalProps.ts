import type { Accounts, Employee } from "@/types/employees";

export type ManagerDetailsModalProps = { manager: Employee; accounts: Accounts; canEdit: boolean; onClose: () => void };
