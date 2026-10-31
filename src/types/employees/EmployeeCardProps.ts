import type { Accounts } from "./Accounts";
import type { Employee } from "./Employee";
import type { Partner } from "./Partner";
import type { PersonStatus } from "./PersonStatus";

export type EmployeeCardProps = {
  partners: Partner[];
  accounts: Accounts;
  todayCount: number;
  monthCount: number;
  status?: PersonStatus;
  employee: Employee;
  admin: boolean;
};
