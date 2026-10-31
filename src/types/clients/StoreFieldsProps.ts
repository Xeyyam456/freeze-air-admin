import type { Store } from "./Store";
import type { Kind } from "@/types/clients";

export type StoreFieldsProps = { s?: Store; companyId: number; kind: Kind };
