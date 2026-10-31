import type { AllLog } from "./AllLog";
import type { FileCount } from "@/types/workLogs";

export type AllLogRowProps = { l: AllLog; files: FileCount | undefined; onOpen: (id: number) => void };
