import type { Accounts } from "./Accounts";
import type { EmployeesData } from "./EmployeesData";

export type EmployeeListProps = Omit<EmployeesData, "emails"> & { accounts: Accounts; admin: boolean };
