import type { PanelView } from "./PanelView";

export type RecentRowProps = { row: PanelView["recent"][number]; onOpen: (id: number) => void };
