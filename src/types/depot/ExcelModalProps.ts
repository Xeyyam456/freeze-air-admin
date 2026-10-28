import type { Tool } from "./Tool";
import type { Holding } from "./Holding";
import type { DepotEmployee } from "./DepotEmployee";

export type ExcelModalProps = { tools: Tool[]; holdings: Holding[]; employees: DepotEmployee[]; onClose: () => void };
