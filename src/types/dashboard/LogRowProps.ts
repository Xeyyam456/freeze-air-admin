import type { FileCount } from "@/lib/jobs";
import type { HomeLog } from "./HomeLog";

export type LogRowProps = { log: HomeLog; files: FileCount | undefined; onOpen: () => void };
