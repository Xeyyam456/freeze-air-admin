import type { LogDay } from "./LogDay";
import type { WorkLog } from "./WorkLog";

export type LogDaysProps = {
  days: LogDay[] | null;
  filesOf: (l: WorkLog) => import("@/lib/jobs").FileCount | undefined;
  openCrews: Set<string>;
  onToggleCrew: (key: string) => void;
  onOpen: (id: number) => void;
};
