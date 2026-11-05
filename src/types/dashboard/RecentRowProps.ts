import type { PanelView } from "./PanelView";

export type RecentRowProps = { row: PanelView["recent"][number]; index: number; fresh: boolean; onOpen: (id: number) => void };
