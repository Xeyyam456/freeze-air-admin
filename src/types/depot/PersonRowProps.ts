import type { DepotEmployee } from "./DepotEmployee";
import type { Holding } from "./Holding";
import type { Tool } from "./Tool";
import type { Kind } from "./Kind";

export type PersonRowProps = {
  emp: DepotEmployee; holds: Holding[]; toolInfo: Map<number, Tool>; onOpen: (kind: Kind) => void;
};
