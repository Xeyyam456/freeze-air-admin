import type { Employee } from "./Employee";
import type { PersonStat } from "./PersonStat";
import type { PersonStatus } from "./PersonStatus";

export type PersonCardProps = {
  person: Employee;
  subtitle: React.ReactNode;
  badge?: string;
  highlight?: boolean;
  status?: PersonStatus;
  stats?: PersonStat[];
  actions?: React.ReactNode; // redaktə/sil: kliki karta keçmir
  footer?: React.ReactNode; // təcrübənin yanında əlavə sətir (məs. hesab vəziyyəti)
  onOpen: () => void;
};
