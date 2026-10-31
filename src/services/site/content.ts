import { revalidateSite } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import type { EquipmentInput, FaqInput, SegmentInput, ServiceInput, StatInput } from "@/types/site";
import { errorText } from "./errorText";
import { removeSiteImage } from "./images";

// Obyekt növü: yeni (id yoxdur) və ya mövcud
export async function saveSegment(id: number | null, input: SegmentInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id
    ? await supabase.from("site_segments").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from("site_segments").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteSegment(id: number, imageUrl: string | null) {
  await removeSiteImage(imageUrl);
  await createClient().from("site_segments").delete().eq("id", id);
  revalidateSite();
}

export async function saveService(id: number | null, input: ServiceInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id
    ? await supabase.from("site_services").update(input).eq("id", id)
    : await supabase.from("site_services").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteService(id: number, imageUrl: string | null) {
  await removeSiteImage(imageUrl);
  await createClient().from("site_services").delete().eq("id", id);
  revalidateSite();
}

export async function saveEquipment(id: number | null, input: EquipmentInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id
    ? await supabase.from("site_equipment").update(input).eq("id", id)
    : await supabase.from("site_equipment").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteEquipment(id: number, imageUrl: string | null) {
  await removeSiteImage(imageUrl);
  await createClient().from("site_equipment").delete().eq("id", id);
  revalidateSite();
}

export async function saveStat(id: number | null, input: StatInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id ? await supabase.from("site_stats").update(input).eq("id", id) : await supabase.from("site_stats").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteStat(id: number) {
  await createClient().from("site_stats").delete().eq("id", id);
  revalidateSite();
}

export async function saveFaq(id: number | null, input: FaqInput): Promise<string | null> {
  const supabase = createClient();
  const { error } = id ? await supabase.from("site_faq").update(input).eq("id", id) : await supabase.from("site_faq").insert(input);
  if (error) return errorText(error);
  revalidateSite();
  return null;
}

export async function deleteFaq(id: number) {
  await createClient().from("site_faq").delete().eq("id", id);
  revalidateSite();
}
