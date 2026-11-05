import type { PanelView } from "./PanelView";

export type RecentWorkProps = { rows: PanelView["recent"]; today: string; onOpen: (id: number) => void; onAll: () => void };
