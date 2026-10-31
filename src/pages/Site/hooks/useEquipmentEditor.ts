import { useState } from "react";
import { toast } from "@/lib/toast";
import { saveEquipment } from "@/services/site/content";
import type { SiteEquipment } from "@/types/site";
import { isSlug } from "../utils/formText";
import { useSiteImagePicker } from "./useSiteImagePicker";
import { useTitleSlug } from "./useTitleSlug";

// Avadanlıq redaktorunun vəziyyəti və saxlanması (açar = ünvan kimi)
export function useEquipmentEditor(item: SiteEquipment | null, onClose: () => void) {
  const ts = useTitleSlug(item?.title ?? "", item?.key ?? "", !!item);
  const picker = useSiteImagePicker("equipment", item?.image_url ?? null, "Şəkil yüklənmədi. JPG, PNG və ya WebP olmalıdır.");
  const [pending, setPending] = useState(false);

  async function cancel() {
    await picker.discard();
    onClose();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!ts.title.trim()) return toast.error("Ad vacibdir.");
    if (!isSlug(ts.slug)) return toast.error("Açar yalnız kiçik latın hərfləri, rəqəm və tire ola bilər.");

    setPending(true);
    const err = await saveEquipment(item?.id ?? null, {
      title: ts.title.trim(),
      key: ts.slug,
      text: String(fd.get("text") ?? "").trim(),
      place: String(fd.get("place") ?? "").trim(),
      image_url: picker.imageUrl,
      sort: Number(fd.get("sort") ?? 0) || 0,
      is_active: fd.get("is_active") === "on",
    });
    setPending(false);
    if (err) return toast.error(err);
    await picker.finalize(item?.image_url ?? null);
    onClose();
  }

  return { ts, picker, pending, cancel, submit };
}
