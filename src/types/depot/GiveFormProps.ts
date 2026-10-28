import type { Tool } from "./Tool";
import type { DepotEmployee } from "./DepotEmployee";

export type GiveFormProps = { tool: Tool; employees: DepotEmployee[]; onDone?: () => void };
