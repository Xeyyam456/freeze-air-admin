import { useState } from "react";
import { toast } from "@/lib/toast";
import { saveService } from "@/services/site/content";
import type { SiteService } from "@/types/site";
import { isSlug, lines } from "../utils/formText";
import { useSiteImagePicker } from "./useSiteImagePicker";
import { useTitleSlug } from "./useTitleSlug";

// Xidmət redaktorunun vəziyyəti və saxlanması
export function useServiceEditor(service: SiteService | null, onClose: () => void) {
  const ts = useTitleSlug(service?.title ?? "", service?.slug ?? "", !!service);
  const picker = useSiteImagePicker("services", service?.image_url ?? null, "Şəkil yüklənmədi. JPG, PNG və ya WebP, 3 MB-dan kiçik olmalıdır.");
  const [icon, setIcon] = useState(service?.icon ?? "wrench");
  const [pending, setPending] = useState(false);

  async function cancel() {
    await picker.discard();
    onClose();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!ts.title.trim()) return toast.error("Ad vacibdir.");
    if (!isSlug(ts.slug)) return toast.error("Ünvan yalnız kiçik latın hərfləri, rəqəm və tire ola bilər.");

    setPending(true);
    const err = await saveService(service?.id ?? null, {
      title: ts.title.trim(),
      slug: ts.slug,
      text: String(fd.get("text") ?? "").trim(),
      lead: String(fd.get("lead") ?? "").trim(),
      details: String(fd.get("details") ?? "").trim(),
      includes: lines(String(fd.get("includes") ?? "")),
      steps: lines(String(fd.get("steps") ?? "")),
      note: String(fd.get("note") ?? "").trim(),
      image_url: picker.imageUrl,
      icon,
      sort: Number(fd.get("sort") ?? 0) || 0,
      is_active: fd.get("is_active") === "on",
    });
    setPending(false);
    if (err) return toast.error(err);
    await picker.finalize(service?.image_url ?? null);
    toast.success(service ? "Xidmət yadda saxlanıldı" : "Xidmət əlavə edildi", "Saytda ən gec 1 dəqiqəyə görünəcək.");
    onClose();
  }

  return { ts, picker, icon, setIcon, pending, cancel, submit };
}
