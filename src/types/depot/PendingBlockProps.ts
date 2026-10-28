import type { DepotRequest } from "./DepotRequest";
import type { Holding } from "./Holding";
import type { Tool } from "./Tool";

export type PendingBlockProps = {
  requests: DepotRequest[]; holdings: Holding[]; tools: Tool[]; myUid: string | null; owner: boolean;
};
