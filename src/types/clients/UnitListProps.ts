import type { Store } from "./Store";
import type { Kind } from "@/types/clients";

export type UnitListProps = { units: Store[]; kind: Kind; admin: boolean };
