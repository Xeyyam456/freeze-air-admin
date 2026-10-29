import type { WorkLog } from "./WorkLog";

export type CrewRowProps = {
  names: string;
  logs: WorkLog[];
  open: boolean;
  onToggle: () => void;
  filesOf: (l: WorkLog) => import("@/lib/jobs").FileCount | undefined;
  onOpen: (id: number) => void;
};
