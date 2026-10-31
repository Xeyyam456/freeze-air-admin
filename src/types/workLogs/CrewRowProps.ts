import type { WorkLog } from "./WorkLog";

export type CrewRowProps = {
  names: string;
  logs: WorkLog[];
  open: boolean;
  onToggle: () => void;
  filesOf: (l: WorkLog) => import("@/types/workLogs").FileCount | undefined;
  onOpen: (id: number) => void;
};
