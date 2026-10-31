import type { DashboardProps } from "./DashboardProps";

export type MastersCardProps = DashboardProps & { onOpenLogs: (name: string) => void };
