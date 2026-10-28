import type { Tool } from "./Tool";
import type { DepotEmployee } from "./DepotEmployee";

export type QuickGiveModalProps = { tool: Tool; employees: DepotEmployee[]; onClose: () => void };
