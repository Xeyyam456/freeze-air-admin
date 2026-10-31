import type { RequestCounts } from "./RequestCounts";
import type { RequestFilter } from "./RequestFilter";

export type RequestFiltersProps = { filter: RequestFilter; onFilter: (f: RequestFilter) => void; counts: RequestCounts; query: string; onQuery: (q: string) => void };
