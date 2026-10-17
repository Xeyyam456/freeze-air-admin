import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Səbət (yalnız admin; RLS + restore_trash() yoxlayır). Silinən sətirlərin nüsxəsini bazadakı tətikçilər saxlayır.

// Bir silmə əməliyyatını (batch) geri qaytarır: şirkətin filialları, alətin təhvilləri və parçaları ilə birlikdə.
// Eyni ad/kod artıq varsa baza xəta qaytarır və heç nə dəyişmir.
export async function restoreTrash(batch: number) {
  const { error } = await createClient().rpc("restore_trash", { p_batch: batch });
  if (error) {
    toast.error(error.code === "23505" ? "Eyni adlı və ya kodlu qeyd artıq var: əvvəl onu dəyiş və ya sil." : error.message);
    return;
  }
  revalidate();
  toast.success("Bərpa olundu");
}

// Həmişəlik silmə: nüsxə də itir, geri qayıtmır
export async function purgeTrash(batch: number) {
  const { error } = await createClient().from("trash").delete().eq("batch", batch);
  if (error) {
    toast.error(error.message);
    return;
  }
  revalidate();
  toast.success("Həmişəlik silindi");
}
