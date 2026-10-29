import type { Place } from "./Place";

export type PlaceListProps = {
  loading: boolean;
  groups: [string, Place[]][];
  trimmed: string;
  empty: boolean;
  customIndex: number;
  active: number;
  onActive: (i: number) => void;
  onChoose: (i: number, p?: Place) => void;
};
