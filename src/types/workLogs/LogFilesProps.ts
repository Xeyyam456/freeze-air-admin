import type { ViewingFile } from "./ViewingFile";
import type { WorkLogDetail } from "./WorkLogDetail";

export type LogFilesProps = { log: WorkLogDetail; onView: (f: ViewingFile) => void };
