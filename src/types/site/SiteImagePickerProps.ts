import type { SiteImagePickerState } from "./SiteImagePickerState";

// Şəkil seçimi: önizləmə + "Yüklə / Dəyiş" + götür. children — önizləmə ilə düymələr arasında (məs. şəklin hissəsi)
export type SiteImagePickerProps = {
  picker: SiteImagePickerState;
  label: string;
  empty: string;
  previewClass: string; // aspect-... sinfi
  imgClass: string;
  hint?: string;
  hintClass?: string;
  children?: React.ReactNode;
};
