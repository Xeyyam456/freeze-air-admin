import type { ClientListRow } from "./ClientListRow";
import type { Kind } from "@/types/clients";

export type ClientTableProps = { clients: ClientListRow[]; kind: Kind };
