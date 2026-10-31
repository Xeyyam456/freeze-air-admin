import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { loadPlaces } from "@/services/workLogs/places";
import { removeLogFiles, uploadLogFiles, upsertLog } from "@/services/workLogs/saveLog";
import type { Place, WorkLogFormProps } from "@/types/workLogs";

// İş formunun vəziyyəti: yer, akt, şəkillər, silinəcək mövcud fayllar; redaktədə təsdiq, sonra yadda saxlama
export function useWorkLogForm({ employeeId, existing, onClose, onSaved }: WorkLogFormProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(existing?.place ?? null);
  const [act, setAct] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set()); // silinməsi seçilmiş mövcud fayllar
  const [confirmData, setConfirmData] = useState<FormData | null>(null); // redaktədə təsdiq gözləyən forma
  const [pending, setPending] = useState(false);

  const toggleRemove = (id: number) =>
    setRemoved((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    loadPlaces().then(setPlaces);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!place) return toast.error("İşin görüldüyü yeri seç.");
    if (!String(form.get("description") ?? "").trim()) return toast.error("Görülən işi yaz.");
    // Redaktədə əvvəl "Məlumatların doğruluğunu təsdiq edirsinizmi?" soruşulur
    if (existing) setConfirmData(form);
    else save(form);
  }

  async function save(form: FormData) {
    if (!place) return;
    setPending(true);
    const res = await upsertLog({
      work_date: String(form.get("work_date")), store_id: place.storeId, company_id: place.companyId,
      place_text: place.custom, description: String(form.get("description") ?? "").trim(),
    }, employeeId, existing?.id);
    if ("error" in res) {
      setPending(false);
      return toast.error(res.error);
    }
    // Silinməsi seçilmiş fayllar; yeni akt seçilibsə köhnə akt da əvəz olunur
    const toRemove = (existing?.files ?? []).filter((f) => removed.has(f.id) || (act && f.kind === "act"));
    if (toRemove.length) await removeLogFiles(toRemove);
    const failed = await uploadLogFiles(res.logId, [...(act ? [{ file: act, kind: "act" }] : []), ...photos.map((f) => ({ file: f, kind: "photo" }))]);
    setPending(false);
    if (failed.length) {
      // İş yazılıb, amma bəzi fayllar yüklənməyib: istifadəçiyə deyirik, pəncərəni bağlamırıq
      onSaved();
      return toast.error(`İş saxlanıldı, amma bu fayllar yüklənmədi: ${failed.join(", ")}. Fayl 10 MB-dan böyük olmamalı, şəkil və ya PDF olmalıdır.`);
    }
    onSaved();
    toast.success(existing ? "İş yeniləndi" : "İş əlavə edildi");
    onClose();
  }

  return {
    places, place, setPlace, act, setAct, photos, setPhotos, removed, toggleRemove, confirmData, setConfirmData, pending, onSubmit, save,
    hasAct: (existing?.files ?? []).filter((f) => !removed.has(f.id)).some((f) => f.kind === "act"),
  };
}
