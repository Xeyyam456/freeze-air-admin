
import { useEffect, useState } from "react";
import { FileText, ImagePlus, X } from "lucide-react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DatePicker } from "@/components/DatePicker";
import { Buttons, Field } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { norm, PlacePicker, type Place } from "./PlacePicker";
import { toast } from "@/lib/toast";

export type { Place };

// Redaktə üçün mövcud iş
export type ExistingLog = {
  id: number;
  work_date: string;
  description: string;
  place: Place;
  files: { id: number; kind: string; path: string; url?: string }[];
};

// Bütün yerlər: əvvəl sabit məkanlı şirkətlər, sonra hər şəbəkənin mağazaları koda görə
export async function loadPlaces(): Promise<Place[]> {
  const supabase = createClient();
  const [{ data: stores }, { data: companies }] = await Promise.all([
    supabase.from("stores").select("id, code, name, address, companies(name)"),
    supabase.from("companies").select("id, name, address, stores(count)").eq("kind", "company").order("name"),
  ]);

  // Filialı olmayan şirkətlər özü yerdir (stadion, Port Baku)
  const fixed: Place[] = (companies ?? [])
    .filter((c) => (c.stores[0]?.count ?? 0) === 0)
    .map((c) => ({
      key: `c${c.id}`, storeId: null, companyId: c.id, custom: null,
      group: "Sabit məkanlar", label: c.name, sub: c.address ?? "",
      search: norm(`${c.name} ${c.address}`),
    }));

  const fromStores: Place[] = (stores ?? [])
    .map((s) => {
      const owner = s.companies?.name ?? "";
      return {
        key: `s${s.id}`, storeId: s.id, companyId: null, custom: null,
        group: owner, label: `${s.code} ${s.name}`, sub: s.address ?? "",
        search: norm(`${owner} ${s.code} ${s.name} ${s.address}`),
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group, "az") || a.label.localeCompare(b.label, "az", { numeric: true }));

  return [...fixed, ...fromStores];
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ext(file: File) {
  return file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
}

export function WorkLogForm({ employeeId, employeeName, existing, onClose, onSaved }: {
  employeeId: number;
  employeeName: string;
  existing?: ExistingLog;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(existing?.place ?? null);
  const [act, setAct] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set()); // silinməsi seçilmiş mövcud fayllar
  const [confirmData, setConfirmData] = useState<FormData | null>(null); // redaktədə təsdiq gözləyən forma
  const [pending, setPending] = useState(false);

  const keptFiles = (existing?.files ?? []).filter((f) => !removed.has(f.id));
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
    const description = String(form.get("description") ?? "").trim();
    const fields = {
      work_date: String(form.get("work_date")),
      store_id: place.storeId,
      company_id: place.companyId,
      place_text: place.custom,
      description,
    };

    setPending(true);
    const supabase = createClient();

    let logId: number;
    if (existing) {
      const { error: upErr } = await supabase.from("work_logs").update(fields).eq("id", existing.id);
      if (upErr) {
        setPending(false);
        return toast.error(upErr.message);
      }
      logId = existing.id;
    } else {
      const { data: log, error: logError } = await supabase
        .from("work_logs")
        .insert({ ...fields, employee_id: employeeId })
        .select("id")
        .single();
      if (logError || !log) {
        setPending(false);
        return toast.error(logError?.message ?? "Yadda saxlanmadı.");
      }
      logId = log.id;
    }

    // Silinməsi seçilmiş fayllar; yeni akt seçilibsə köhnə akt da əvəz olunur
    const toRemove = (existing?.files ?? []).filter((f) => removed.has(f.id) || (act && f.kind === "act"));
    if (toRemove.length) {
      await supabase.storage.from("work").remove(toRemove.map((f) => f.path));
      await supabase.from("work_files").delete().in("id", toRemove.map((f) => f.id));
    }

    // Yeni fayllar: work/<log id>/<təsadüfi ad>
    const files = [...(act ? [{ file: act, kind: "act" }] : []), ...photos.map((f) => ({ file: f, kind: "photo" }))];
    const failed: string[] = [];
    for (const { file, kind } of files) {
      const path = `${logId}/${crypto.randomUUID()}.${ext(file)}`;
      const { error: upError } = await supabase.storage.from("work").upload(path, file, { contentType: file.type });
      if (upError) {
        failed.push(file.name);
        continue;
      }
      await supabase.from("work_files").insert({ work_log_id: logId, kind, path });
    }

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

  return (
    <Modal onClose={onClose} labelledBy="work-form-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="work-form-title" className="text-lg font-bold">{existing ? "İşi redaktə et" : "Yeni iş"}</h2>
          <p className="muted text-sm">{employeeName}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Tarix">
          <DatePicker name="work_date" defaultValue={existing?.work_date ?? today()} max={today()} required />
        </Field>

        <div>
          <span className="label">Yer</span>
          <PlacePicker places={places} value={place} onChange={setPlace} />
        </div>

        <Field label="Görülən iş">
          <textarea name="description" rows={3} required className="field resize-none" defaultValue={existing?.description}
            placeholder="Məs. 2 ədəd split kondisionerin profilaktikası, freon dolduruldu" />
        </Field>

        {/* Redaktədə mövcud fayllar: × ilə silinməyə işarələnir, saxlayanda silinir */}
        {existing && existing.files.length > 0 && (
          <div>
            <span className="label">Mövcud fayllar</span>
            <div className="flex flex-wrap gap-2">
              {existing.files.map((f) => {
                const gone = removed.has(f.id);
                return (
                  <div key={f.id} className={`relative ${gone ? "opacity-40" : ""}`}>
                    {f.kind === "act" ? (
                      <span className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold">
                        <FileText size={16} className="text-primary" /> Akt
                      </span>
                    ) : (
                      <img src={f.url} alt="İşin şəkli" className="h-14 w-14 rounded-lg border border-line object-cover" />
                    )}
                    <button type="button" onClick={() => toggleRemove(f.id)}
                      className={`absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-white shadow ${gone ? "bg-muted" : "bg-danger"}`}
                      title={gone ? "Silməni ləğv et" : "Sil"} aria-label={gone ? "Silməni ləğv et" : "Faylı sil"}>
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            {removed.size > 0 && <p className="mt-1 text-xs text-danger">{removed.size} fayl yadda saxlayanda silinəcək.</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <FileText size={18} className="text-primary" />
            <span className="text-sm font-semibold">Akt</span>
            <span className="muted w-full truncate text-xs">{act ? act.name : keptFiles.some((f) => f.kind === "act") ? "yenisi köhnəni əvəz edir" : "şəkil və ya PDF"}</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only"
              onChange={(e) => setAct(e.target.files?.[0] ?? null)} />
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <ImagePlus size={18} className="text-primary" />
            <span className="text-sm font-semibold">İşin şəkilləri</span>
            <span className="muted text-xs">{photos.length ? `${photos.length} şəkil seçildi` : "bir neçə şəkil"}</span>
            <input type="file" accept="image/*" multiple className="sr-only"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} />
          </label>
        </div>

        <Buttons pending={pending} label={existing ? "Yadda saxla" : "İşi yadda saxla"} onCancel={onClose} />
        <ConfirmModal
          open={!!confirmData}
          title="Məlumatların doğruluğunu təsdiq edirsinizmi?"
          message="İşdəki dəyişikliklər yadda saxlanılacaq."
          confirmLabel="Bəli, yadda saxla"
          onCancel={() => setConfirmData(null)}
          onConfirm={() => {
            const form = confirmData;
            setConfirmData(null);
            if (form) save(form);
          }}
        />
      </form>
    </Modal>
  );
}
