import type { DepotEmployee } from "./DepotEmployee";
import type { Holding } from "./Holding";
import type { LossRow } from "./LossRow";
import type { Tool } from "./Tool";

// Excel vərəqlərinin ortaq məlumatı
export type Ctx = { tools: Tool[]; holdings: Holding[]; employees: DepotEmployee[]; stamp: string; losses: LossRow[] };
