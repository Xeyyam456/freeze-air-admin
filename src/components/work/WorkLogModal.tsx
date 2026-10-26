import { useState } from "react";
import { CalendarDays, Clock, FileText, Home, MapPin, X } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeForms";
import { MapButton } from "@/components/MapButton";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

type Place = { code?: string | null; name: string; address: string | null; lat: number | null; lng: number | null };

// "14:32"
export function timeOf(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// "17.10.2026"
function dateOf(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

async function fetchLog(id: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from("work_logs")
    .select(`id, work_date, created_at, description, place_text,
      employees(full_name, photo_url, specialty),
      stores(code, name, address, lat, lng, companies(name)),
      companies(name, address, lat, lng),
      work_files(id, kind, path),
      tasks(reason, note, group_id),
      work_log_materials(id, amount, tools(name, unit))`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return undefined; // tapılmadı (null = hələ yüklənir)

  // Qrup işi (0071): eyni tapşırığın bütün üzvləri; akt və şəkil yalnız bir üzvün iş qeydinə yüklənmiş ola bilər,
  // ona görə qrupun bütün iş qeydlərinin faylları göstərilir
  const groupId = data.tasks?.[0]?.group_id;
  const groupTasks = groupId
    ? ((await supabase.from("tasks").select("work_log_id, employees(full_name, photo_url, specialty)").eq("group_id", groupId).is("cancelled_at", null)).data ?? [])
    : [];
  const members = groupTasks.map((t) => t.employees).filter((e): e is NonNullable<typeof e> => !!e);
  const otherLogIds = groupTasks.map((t) => t.work_log_id).filter((x): x is number => x != null && x !== data.id);
  const moreFiles = otherLogIds.length
    ? ((await supabase.from("work_files").select("id, kind, path").in("work_log_id", otherLogIds)).data ?? [])
    : [];
  const allFiles = [...data.work_files, ...moreFiles];

  // Qapalı storage: fayllara 1 saatlıq imzalı link
  const paths = allFiles.map((f) => f.path);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("work").createSignedUrls(paths, 3600);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }
  return { ...data, members, files: allFiles.map((f) => ({ ...f, url: urls.get(f.path) })) };
}

// İş qeydinin ətraflı pəncərəsi: kim, harada, nə vaxt (iş günü + əlavə olunma saatı), nə edib, akt və şəkillər
export function WorkLogModal({ logId, onClose }: { logId: number; onClose: () => void }) {
  const log = useData(() => fetchLog(logId), [logId]);

  const owner = log?.stores?.companies?.name ?? log?.companies?.name ?? null;
  const placeName = log?.stores ? log.stores.name : log?.companies ? log.companies.name : log?.place_text ?? "Yer silinib";
  const place: Place | null = log?.stores
    ? { code: log.stores.code, name: `${owner ?? ""} · ${log.stores.name}`, address: log.stores.address, lat: log.stores.lat, lng: log.stores.lng }
    : log?.companies
      ? { name: log.companies.name, address: log.companies.address, lat: log.companies.lat, lng: log.companies.lng }
      : null;
  const task = log?.tasks?.[0] ?? null; // bu iş tapşırıqdan yaranıbsa
  const act = log?.files.find((f) => f.kind === "act");
  // Akt və şəkillər yeni səhifədə yox, pəncərədə açılır
  const [viewing, setViewing] = useState<{ url: string; title: string; pdf: boolean } | null>(null);
  const photos = log?.files.filter((f) => f.kind === "photo") ?? [];

  return (
    <Modal onClose={onClose} labelledBy="work-log-title" className="!max-w-2xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 id="work-log-title" className="text-lg font-bold">İş qeydi</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {log === null ? (
        <p className="muted grid min-h-[300px] place-items-center text-sm">Yüklənir...</p>
      ) : log === undefined ? (
        <p className="muted py-8 text-center text-sm">İş qeydi tapılmadı (silinmiş ola bilər).</p>
      ) : (
        <div className="space-y-4">
          {/* Usta və vaxt */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-bg p-4">
            {log.members.length > 1 ? (
              <>
                <div className="flex shrink-0 -space-x-3">
                  {log.members.map((m) => <Avatar key={m.full_name} employee={{ full_name: m.full_name, photo_url: m.photo_url }} className="!h-12 !w-12 !text-sm ring-2 ring-bg" />)}
                </div>
                <div className="min-w-[9rem] flex-1">
                  {/* Hər usta öz sətrində: uzun adlar sözbəsöz sınmasın */}
                  <p className="font-semibold leading-snug">{log.members.map((m) => <span key={m.full_name} className="block">{m.full_name}</span>)}</p>
                  <p className="muted whitespace-nowrap text-sm">Qrup işi · {log.members.length} usta</p>
                </div>
              </>
            ) : (
              <>
                <Avatar employee={{ full_name: log.employees?.full_name ?? "?", photo_url: log.employees?.photo_url ?? null }} className="!h-12 !w-12 !text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{log.employees?.full_name ?? "—"}</p>
                  <p className="muted text-sm">{log.employees?.specialty ?? "Usta"}</p>
                </div>
              </>
            )}
            <div className="grid gap-1 text-right text-sm max-sm:basis-full max-sm:border-t max-sm:border-line max-sm:pt-2.5 max-sm:text-left">
              <span className="flex items-center justify-end gap-1.5 font-semibold max-sm:justify-start"><CalendarDays size={14} className="text-primary" /> {formatDateAz(log.work_date)}</span>
              <span className="muted flex items-center justify-end gap-1.5 text-xs max-sm:justify-start">
                <Clock size={13} /> Əlavə edilib: {dateOf(log.created_at)}, {timeOf(log.created_at)}
              </span>
            </div>
          </div>

          {/* Harada */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
            <span className="icon-tile !h-10 !w-10 shrink-0">{log.place_text ? <Home size={18} /> : <MapPin size={18} />}</span>
            <div className="min-w-0 flex-1">
              {owner && <p className="muted text-xs font-semibold">{owner}</p>}
              <p className="font-bold text-primary">
                {log.stores?.code && <span className="code-badge mr-1.5">{log.stores.code}</span>}
                {placeName}
              </p>
              {place?.address && <p className="muted mt-0.5 text-sm">{place.address}</p>}
              {log.place_text && <p className="muted mt-0.5 text-xs">Siyahıda olmayan yer</p>}
            </div>
            {place && <MapButton place={place} />}
          </div>

          {/* Nə edib: tapşırıqdan yaranan işdə müdirin verdiyi iş (tapşırıq) və ustanın yazdığı görülən iş ayrı göstərilir */}
          {task ? (
            <>
              <div>
                <span className="label">İş (tapşırıq)</span>
                <p className="whitespace-pre-line rounded-xl border border-line bg-bg p-4 text-sm leading-relaxed">{task.reason}</p>
              </div>
              <div>
                <span className="label">Görülən iş</span>
                {task.note
                  ? <p className="whitespace-pre-line rounded-xl border border-line p-4 text-sm leading-relaxed">{task.note}</p>
                  : <p className="muted rounded-xl border border-dashed border-line p-4 text-sm">Usta hələ görülən iş barədə yazmayıb.</p>}
              </div>
            </>
          ) : (
            <div>
              <span className="label">Görülən iş</span>
              <p className="whitespace-pre-line rounded-xl border border-line p-4 text-sm leading-relaxed">{log.description}</p>
            </div>
          )}

          {/* Usta bu işdə üzərindəki materialdan nə qədər işlədib (migrasiya 0060; depoda say dəyişmir) */}
          {log.work_log_materials.length > 0 && (
            <div>
              <span className="label">İşlədilən material</span>
              <div className="flex flex-wrap gap-2">
                {log.work_log_materials.map((m) => (
                  <span key={m.id} className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm">
                    <b>{m.tools?.name ?? "—"}</b> <span className="muted">· {String(m.amount).replace(".", ",")} {m.tools?.unit}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Akt və şəkillər */}
          {(act || photos.length > 0) && (
            <div>
              <span className="label">Akt və şəkillər</span>
              <div className="flex flex-wrap gap-2">
                {act?.url && (
                  <button type="button" onClick={() => setViewing({ url: act.url!, title: "Akt", pdf: /\.pdf($|\?)/i.test(act.path) })}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-bg text-xs font-semibold hover:border-primary">
                    <FileText size={22} className="text-primary" /> Akt
                  </button>
                )}
                {photos.map((p) => p.url && (
                  <button key={p.id} type="button" onClick={() => setViewing({ url: p.url!, title: "İşin şəkli", pdf: false })} title="Şəkli böyüt">
                    <img src={p.url} alt="İşin şəkli" className="h-24 w-24 rounded-xl border border-line object-cover hover:border-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {viewing && (
        <Modal onClose={() => setViewing(null)} labelledBy="work-file-title" className="!max-w-3xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="work-file-title" className="text-lg font-bold">{viewing.title}</h2>
            <button type="button" onClick={() => setViewing(null)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          {viewing.pdf
            ? <iframe src={viewing.url} title={viewing.title} className="h-[70vh] w-full rounded-xl border border-line" />
            : <img src={viewing.url} alt={viewing.title} className="max-h-[75vh] w-full rounded-xl object-contain ring-1 ring-line" />}
        </Modal>
      )}
    </Modal>
  );
}
