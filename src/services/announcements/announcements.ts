import { createClient } from "@/lib/supabase/client";
import type { Announcement } from "@/types/announcements";

// Elanlar (0098): son 100; göndərmək bazada hamıya push bildirişi yaradır (trigger), silmək bildirişi geri qaytarmır
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await createClient().from("announcements")
    .select("id, title, body, created_by, created_by_name, created_at").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createAnnouncement(title: string, body: string): Promise<string | null> {
  const { error } = await createClient().from("announcements").insert({ title: title.trim(), body: body.trim() });
  return error ? (error.code === "42501" ? "Elanı yalnız rəhbərlik göndərə bilər." : error.message) : null;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const { error } = await createClient().from("announcements").delete().eq("id", id);
  if (error) throw error;
}
