import type { SelectableEmployee } from "@/components/employees/EmployeeSelect";
import type { CrewDraft } from "./CrewDraft";

export type CrewEditorProps = {
  edit: CrewDraft;
  onEdit: (d: CrewDraft) => void;
  employees: SelectableEmployee[];
  taken: Map<number, string>;
  conflicts: number[];
  pending: boolean;
  onSave: () => void;
  onCancel: () => void;
};
