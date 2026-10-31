import type { ClientView } from "./ClientView";

export type ClientsToolbarProps = {
  query: string;
  onQuery: (q: string) => void;
  shown: number;
  total: number;
  view: ClientView;
  onView: (v: ClientView) => void;
};
