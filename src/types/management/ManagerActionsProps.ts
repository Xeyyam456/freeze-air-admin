import type { ManagerCardProps } from "./ManagerCardProps";

export type ManagerActionsProps = ManagerCardProps & { onEdit: () => void; onContact: () => void; light?: boolean };
