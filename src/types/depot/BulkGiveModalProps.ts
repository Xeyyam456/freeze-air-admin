import type { DepotEmployee } from "./DepotEmployee";
import type { Kind } from "./Kind";
import type { Tool } from "./Tool";

export type BulkGiveModalProps = { emp: DepotEmployee; kind: Kind; tools: Tool[]; onClose: () => void };
