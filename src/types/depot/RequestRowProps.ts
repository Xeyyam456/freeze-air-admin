import type { DepotRequest } from "./DepotRequest";
import type { Holding } from "./Holding";
import type { Tool } from "./Tool";

export type RequestRowProps = { r: DepotRequest; holding: Holding | null; tool?: Tool; myUid: string | null; owner: boolean };
