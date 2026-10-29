import type { Place } from "./Place";

// Redaktə üçün mövcud iş
export type ExistingLog = {
  id: number;
  work_date: string;
  description: string;
  place: Place;
  files: { id: number; kind: string; path: string; url?: string }[];
};
