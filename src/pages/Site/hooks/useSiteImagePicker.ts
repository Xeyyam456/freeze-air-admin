import { useRef, useState } from "react";
import { removeSiteImage, uploadSiteImage } from "@/services/site/images";
import { toast } from "@/lib/toast";
import type { SiteImagePickerState } from "@/types/site";

// Redaktorda şəkil seçimi: yüklənən şəkillər saxlanmayana qədər izlənir (ləğvdə və ya dəyişəndə storage-dan silinir)
export function useSiteImagePicker(folder: string, initial: string | null, errorMsg: string): SiteImagePickerState {
  const [imageUrl, setImageUrl] = useState<string | null>(initial);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadedRef = useRef<string[]>([]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(file, folder);
      uploadedRef.current.push(url);
      setImageUrl(url);
    } catch {
      toast.error(errorMsg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Ləğv: bu pəncərədə yüklənən şəkillərin hamısı silinir
  async function discard() {
    for (const url of uploadedRef.current) await removeSiteImage(url);
  }

  // Saxlandıqdan sonra: köhnə şəkil dəyişdirilibsə və ya götürülübsə silinir; saxlanmayan ara şəkillər də
  async function finalize(previousUrl: string | null) {
    if (previousUrl && previousUrl !== imageUrl) await removeSiteImage(previousUrl);
    for (const url of uploadedRef.current) if (url !== imageUrl) await removeSiteImage(url);
  }

  return { imageUrl, setImageUrl, uploading, fileRef, onFile, discard, finalize };
}
