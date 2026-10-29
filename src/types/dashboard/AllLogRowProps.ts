import type { FileCount } from "@/lib/jobs";
import type { AllLog } from "./AllLog";

export type AllLogRowProps = { l: AllLog; files: FileCount | undefined; onOpen: (id: number) => void };
