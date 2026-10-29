import type { WorkLog } from "./WorkLog";
import type { WorkLogFilters } from "./WorkLogFilters";
import type { RangeKind } from "./RangeKind";

export type FiltersPanelProps = {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onRange: (k: RangeKind) => void;
  filters: WorkLogFilters | null;
  employeeId: string;
  onEmployee: (v: string) => void;
  companyId: string;
  onCompany: (v: string) => void;
  query: string;
  onQuery: (v: string) => void;
  list: WorkLog[];
  tooMany: boolean;
};
