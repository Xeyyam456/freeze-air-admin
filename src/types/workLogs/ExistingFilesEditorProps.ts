import type { ExistingLog } from "./ExistingLog";

export type ExistingFilesEditorProps = { files: ExistingLog["files"]; removed: Set<number>; onToggle: (id: number) => void };
