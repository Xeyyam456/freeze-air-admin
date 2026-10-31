import type { Employee } from "@/types/employees";
import type { ManagerCardProps } from "./ManagerCardProps";

export type ManagerGroupsProps = { filtered: Employee[]; cardOf: (m: Employee) => ManagerCardProps };
