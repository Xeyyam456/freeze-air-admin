export type BoardToolbarProps = {
  month: string;
  thisMonth: string;
  query: string;
  canExport: boolean;
  onMonth: (month: string) => void;
  onQuery: (query: string) => void;
  onExport: () => void;
};
