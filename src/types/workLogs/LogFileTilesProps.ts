import type { EmployeeLogFile } from "./EmployeeLogFile";

export type LogFileTilesProps = { files: EmployeeLogFile[]; onPlay: (url: string) => void };
