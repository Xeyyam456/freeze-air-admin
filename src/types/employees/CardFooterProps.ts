import type { Accounts } from "./Accounts";
import type { Employee } from "./Employee";
import type { Partner } from "./Partner";

export type CardFooterProps = { employee: Employee; partners: Partner[]; accounts: Accounts; admin: boolean };
