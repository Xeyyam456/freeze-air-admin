import type { WorkLog } from "./WorkLog";

export type SoloRowProps = { l: WorkLog; files: import("@/types/workLogs").FileCount | undefined; onOpen: (id: number) => void };
