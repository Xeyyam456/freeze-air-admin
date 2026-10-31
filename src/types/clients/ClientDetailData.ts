import type { Company } from "./Company";
import type { Store } from "./Store";

export type ClientDetailData = { client: Company | null; units: Store[] };
