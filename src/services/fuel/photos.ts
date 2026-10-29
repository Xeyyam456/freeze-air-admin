import { createClient } from "@/lib/supabase/client";

// Qapalı "mileage" bucket-indəki spidometr şəklinin imzalı linki (1 saat)
export async function mileagePhotoUrl(path: string) {
  const { data } = await createClient().storage.from("mileage").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
