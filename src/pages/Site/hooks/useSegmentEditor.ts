import { useState } from "react";
import { toast } from "@/lib/toast";
import { saveSegment } from "@/services/site/content";
import type { SegmentInput, SiteSegment } from "@/types/site";
import { isSlug, lines } from "../utils/formText";
import { useSiteImagePicker } from "./useSiteImagePicker";
import { useTitleSlug } from "./useTitleSlug";

// Obyekt növü redaktorunun vəziyyəti və saxlanması
export function useSegmentEditor(segment: SiteSegment | null, onClose: () => void) {
  const ts = useTitleSlug(segment?.title ?? "", segment?.slug ?? "", !!segment);
  const picker = useSiteImagePicker("segments", segment?.image_url ?? null, "Şəkil yüklənmədi. JPG, PNG və ya WebP, 3 MB-dan kiçik olmalıdır.");
  const [equipment, setEquipment] = useState<string[]>(segment?.equipment ?? ["split"]);
  const [position, setPosition] = useState(segment?.image_position ?? "center");
  const [pending, setPending] = useState(false);

  const toggleEquipment = (kind: string) =>
    setEquipment((list) => (list.includes(kind) ? list.filter((k) => k !== kind) : [...list, kind]));

  async function cancel() {
    await picker.discard();
    onClose();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: SegmentInput = {
      title: ts.title.trim(),
      slug: ts.slug.trim(),
      summary: String(fd.get("summary") ?? "").trim(),
      lead: String(fd.get("lead") ?? "").trim(),
      issues: lines(String(fd.get("issues") ?? "")),
      work: lines(String(fd.get("work") ?? "")),
      note: String(fd.get("note") ?? "").trim(),
      equipment,
      image_url: picker.imageUrl,
      image_position: position,
      sort: Number(fd.get("sort") ?? 0) || 0,
      is_active: fd.get("is_active") === "on",
    };
    if (!input.title) return toast.error("Ad vacibdir.");
    if (!isSlug(input.slug)) return toast.error("Ünvan yalnız kiçik latın hərfləri, rəqəm və tire ola bilər.");

    setPending(true);
    const err = await saveSegment(segment?.id ?? null, input);
    setPending(false);
    if (err) return toast.error(err);
    await picker.finalize(segment?.image_url ?? null);
    onClose();
  }

  return { ts, picker, equipment, toggleEquipment, position, setPosition, pending, cancel, submit };
}
