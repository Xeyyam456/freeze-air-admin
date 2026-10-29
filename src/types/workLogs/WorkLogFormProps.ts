import type { ExistingLog } from "./ExistingLog";

export type WorkLogFormProps = { employeeId: number; employeeName: string; existing?: ExistingLog; onClose: () => void; onSaved: () => void };
