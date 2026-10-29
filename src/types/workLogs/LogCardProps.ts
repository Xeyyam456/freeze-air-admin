import type { EmployeeLog } from "./EmployeeLog";

export type LogCardProps = {
  log: EmployeeLog;
  canDelete: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onOpenGroup: () => void;
  onPlay: (url: string) => void;
};
