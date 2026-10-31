import type { Kind } from "@/lib/kinds";
import type { ClientListRow } from "./ClientListRow";

export type ClientTableProps = { clients: ClientListRow[]; kind: Kind };
