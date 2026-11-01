import { useRef, useState } from "react";
import { revalidate } from "@/lib/revalidate";
import { setEmployeePhoto, uploadAvatar } from "@/services/avatars/avatars";
import { toast } from "@/lib/toast";
import type { AvatarUploadProps } from "@/types/employees";
import { storagePath } from "./storagePath";
import { toSquareWebp } from "./toSquareWebp";

// Şəkil yüklə / sil: dəyişiklik dərhal saxlanır (baza funksiyası set_employee_photo)
export function useAvatarUpload({ employee, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(employee.photo_url);
  const [pending, setPending] = useState(false);

  async function save(url: string | null) {
    await setEmployeePhoto(employee.id, url, storagePath(photoUrl));
    setPhotoUrl(url);
    toast.success(url ? "Şəkil yadda saxlanıldı" : "Şəkil silindi");
    revalidate();
    onChange?.();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Yalnız şəkil faylı seç.");
    setPending(true);
    try {
      const blob = await toSquareWebp(file);
      const path = `${employee.id}/${crypto.randomUUID()}.webp`;
      await save(await uploadAvatar(path, blob));
    } catch {
      toast.error("Şəkil yüklənmədi. Başqa şəkil yoxla.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    setPending(true);
    try {
      await save(null);
    } catch {
      toast.error("Şəkil silinmədi.");
    } finally {
      setPending(false);
    }
  }

  return { inputRef, photoUrl, pending, onFile, onRemove };
}
