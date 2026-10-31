import type { Kind } from "@/lib/kinds";
import type { ClientPanelProps } from "./ClientPanelProps";

export type ClientInfoCardProps = ClientPanelProps & { kind: Kind };
