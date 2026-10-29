export type NumberSaveProps = {
  value: number | null;
  suffix: string;
  placeholder: string;
  onSave: (n: number | null) => Promise<boolean>;
  compact?: boolean;
};
