import type { AttendanceEmployee } from "./AttendanceEmployee";

export type ExportModalProps = { month: string; emps: AttendanceEmployee[]; onClose: () => void };
