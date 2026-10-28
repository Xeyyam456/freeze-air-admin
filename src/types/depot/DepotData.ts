import type { DepotEmployee } from "./DepotEmployee";
import type { DepotRequest } from "./DepotRequest";
import type { Holding } from "./Holding";
import type { Loss } from "./Loss";
import type { Piece } from "./Piece";
import type { Repair } from "./Repair";
import type { Tool } from "./Tool";

// Depo ekranının bütün məlumatı (services/depot/fetchDepot.ts)
export type DepotData = {
  tools: Tool[];
  holdings: Holding[];
  pieces: Piece[];
  employees: DepotEmployee[];
  requests: DepotRequest[];
  repairs: Repair[];
  losses: Loss[];
};
