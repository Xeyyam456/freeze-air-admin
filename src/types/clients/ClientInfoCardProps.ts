import type { ClientPanelProps } from "./ClientPanelProps";
import type { Kind } from "@/types/clients";

export type ClientInfoCardProps = ClientPanelProps & { kind: Kind };
