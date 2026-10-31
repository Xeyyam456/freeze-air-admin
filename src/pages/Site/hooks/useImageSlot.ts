import { useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { removeSiteImage, uploadSiteImage } from "@/services/site/images";
import { updateHomeImage } from "@/services/site/settings";
import type { ImageSlotProps } from "@/types/site";
import { SITE_DELAY } from "../constants/homeConstants";

// Saytın şəkil yeri: yüklənən kimi bazaya yazılır, köhnə şəkil silinir
export function useImageSlot({ field, url, folder }: Pick<ImageSlotProps, "field" | "url" | "folder">) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const next = await uploadSiteImage(file, folder);
      const err = await updateHomeImage(field, next);
      if (err) {
        await removeSiteImage(next);
        toast.error(err);
      } else {
        await removeSiteImage(url);
        toast.success("Şəkil yadda saxlanıldı", SITE_DELAY);
      }
    } catch {
      toast.error("Şəkil yüklənmədi. JPG, PNG və ya WebP olmalıdır.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onRemove() {
    const err = await updateHomeImage(field, null);
    if (err) return toast.error(err);
    await removeSiteImage(url);
    toast.success("Şəkil silindi", SITE_DELAY);
  }

  return { uploading, fileRef, onFile, onRemove };
}
