import type { Accounts, Employee } from "@/types/employees";

export type ManagerCardProps = { manager: Employee; accounts: Accounts; canEdit: boolean; canContact: boolean; isMe: boolean };
