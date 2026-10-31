import type { Kind } from "@/lib/kinds";
import type { Store } from "./Store";

export type UnitListProps = { units: Store[]; kind: Kind; admin: boolean };
