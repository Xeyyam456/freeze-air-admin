import type { HomeImageField } from "./HomeImageField";

// compact: kiçik önizləmə (loqo); hideImage: yalnız düymələr (şəkil başqa yerdə önizlənir)
export type ImageSlotProps = {
  field: HomeImageField;
  url: string | null;
  folder: string;
  hint: string;
  small?: boolean;
  compact?: boolean;
  hideImage?: boolean;
  empty?: string;
};
