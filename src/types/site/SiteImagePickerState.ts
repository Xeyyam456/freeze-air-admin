export type SiteImagePickerState = {
  imageUrl: string | null;
  setImageUrl: (u: string | null) => void;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File | undefined) => Promise<void>;
  discard: () => Promise<void>;
  finalize: (previousUrl: string | null) => Promise<void>;
};
