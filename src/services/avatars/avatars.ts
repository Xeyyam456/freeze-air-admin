import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET } from "./avatarBucket";

// Şəkli bucket-ə yükləyir, ictimai linki qaytarır (xətada atır)
export async function uploadAvatar(path: string, blob: Blob): Promise<string> {
  const storage = createClient().storage.from(AVATAR_BUCKET);
  const { error } = await storage.upload(path, blob, { contentType: "image/webp" });
  if (error) throw error;
  return storage.getPublicUrl(path).data.publicUrl;
}

// Əməkdaşın şəkil linkini bazada dəyişir (set_employee_photo); köhnə faylı silir
export async function setEmployeePhoto(employeeId: number, url: string | null, oldPath: string | null): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("set_employee_photo", { p_employee_id: employeeId, p_url: url });
  if (error) throw error;
  if (oldPath) await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
}
