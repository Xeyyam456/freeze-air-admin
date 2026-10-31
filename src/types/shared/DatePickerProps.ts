export type DatePickerProps = {
  name?: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (v: string) => void;
  min?: string; // bundan əvvəlki günlər seçilmir (məs. tapşırıq: keçmiş günə verilmir)
  max?: string;
  required?: boolean;
  small?: boolean;
  placeholder?: string;
};
