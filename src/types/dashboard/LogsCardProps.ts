import type { DashboardProps } from "./DashboardProps";

export type LogsCardProps = DashboardProps & { onOpen: (id: number) => void; onAll: () => void };
