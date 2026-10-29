import type { WorkLog } from "./WorkLog";

export type SoloRowProps = { l: WorkLog; files: import("@/lib/jobs").FileCount | undefined; onOpen: (id: number) => void };
