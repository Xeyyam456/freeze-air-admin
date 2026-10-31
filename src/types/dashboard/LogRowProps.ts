import type { HomeLog } from "./HomeLog";
import type { FileCount } from "@/types/workLogs";

export type LogRowProps = { log: HomeLog; files: FileCount | undefined; onOpen: () => void };
