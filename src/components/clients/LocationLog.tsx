import { useState } from "react";
import { ArrowRight, Crosshair, ExternalLink, MapPinned, PenLine, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { mapSearchUrl } from "@/lib/navigation";
import { useData } from "@/lib/useData";

type Unit = { id: number; code: string; name: string };
type Log = {
  id: number; place_kind: string; place_id: number; created_at: string; accuracy_m: number | null;
  old_lat: number | null; old_lng: number | null; old_address: string | null;
  new_lat: number | null; new_lng: number | null; new_address: string | null;
  employees: { full_name: string } | null;
};

// Konum jurnalı (0087 place_location_log; yalnız admin oxuyur): ustanın "Konumu düzəlt" ilə etdiyi dəyişikliklər —
// şirkətin özü (sabit məkan) və filial/mağazaları üzrə, ən yenisi yuxarıda
async function fetchLog(companyId: number, units: Unit[]): Promise<Log[]> {
  const supabase = createClient();
  const sel = "id, place_kind, place_id, created_at, accuracy_m, old_lat, old_lng, old_address, new_lat, new_lng, new_address, employees(full_name)";
  const [own, viaUnits] = await Promise.all([
    supabase.from("place_location_log").select(sel).eq("place_kind", "company").eq("place_id", companyId).order("created_at", { ascending: false }).limit(200),
    units.length
      ? supabase.from("place_location_log").select(sel).eq("place_kind", "store").in("place_id", units.map((u) => u.id)).order("created_at", { ascending: false }).limit(200)
      : Promise.resolve({ data: [] as Log[] }),
  ]);
  return [...((own.data ?? []) as Log[]), ...((viaUnits.data ?? []) as Log[])].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// İki koordinat arasındakı məsafə (metr)
function meters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLng - aLng) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}
const distText = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1).replace(".", ",")} km` : `${Math.round(m)} m`);
const when = (iso: string) =>
  new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
const coords = (lat: number | null, lng: number | null) => (lat != null && lng != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "—");

// Başlıqdakı düymə: yalnız dəyişiklik olanda görünür (say ilə); klik → jurnal pəncərəsi
export function LocationLogButton({ companyId, units }: { companyId: number; units: Unit[] }) {
  const logs = useData("location-log", () => fetchLog(companyId, units), [companyId, units.map((u) => u.id).join()]);
  const [open, setOpen] = useState(false);
  if (!logs?.length) return null;
  const unitOf = new Map(units.map((u) => [u.id, u]));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-soft btn-sm" title="Ustaların ünvan/koordinat düzəlişləri">
        <MapPinned size={15} /> <span className="max-sm:hidden">Konum dəyişiklikləri</span> <b className="tabular-nums">{logs.length}</b>
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="loc-log-title" className="flex !max-w-2xl flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="loc-log-title" className="flex items-center gap-2 text-lg font-bold"><MapPinned size={18} className="text-primary" /> Konum dəyişiklikləri</h2>
              <p className="muted text-xs">Ustanın "Konumu düzəlt" ilə dəyişdiyi ünvan və koordinatlar · {logs.length} qeyd</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          <ul className="nice-scroll -mr-2 max-h-[min(560px,calc(100dvh/var(--zoom)-200px))] space-y-2 overflow-y-auto pr-2">
            {logs.map((l) => {
              const u = l.place_kind === "store" ? unitOf.get(l.place_id) : null;
              const moved = l.old_lat != null && l.old_lng != null && l.new_lat != null && l.new_lng != null
                ? meters(l.old_lat, l.old_lng, l.new_lat, l.new_lng) : null;
              const coordChanged = l.old_lat !== l.new_lat || l.old_lng !== l.new_lng;
              const addrChanged = (l.old_address ?? "") !== (l.new_address ?? "");
              return (
                <li key={l.id} className="rounded-xl border border-line p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="min-w-0 font-semibold">
                      {u ? <><span className="code-badge mr-1.5">{u.code}</span>{u.name}</> : "Şirkətin özü (sabit məkan)"}
                    </p>
                    <p className="muted shrink-0 text-xs tabular-nums">{when(l.created_at)}</p>
                  </div>
                  <p className="muted mt-0.5 text-xs">{l.employees?.full_name ?? "Usta silinib"}</p>

                  {addrChanged && (
                    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px]">
                      <span className="text-muted line-through">{l.old_address || "ünvan yox idi"}</span>
                      <ArrowRight size={13} className="shrink-0 text-muted" />
                      <span className="font-semibold">{l.new_address || "ünvan silindi"}</span>
                    </p>
                  )}
                  {coordChanged && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs tabular-nums">
                      <span className="text-muted">{coords(l.old_lat, l.old_lng)}</span>
                      <ArrowRight size={12} className="shrink-0 text-muted" />
                      <span className="font-semibold">{coords(l.new_lat, l.new_lng)}</span>
                      {moved != null && (
                        <span className={`rounded-full px-2 py-0.5 font-bold ${moved > 1000 ? "bg-[#fff0f0] text-[#dc2626]" : "bg-bg text-ink"}`} title="Köhnə və yeni nöqtə arasındakı məsafə">
                          {distText(moved)} yerdəyişmə
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {l.accuracy_m != null
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 font-semibold text-ok" title="Telefonun GPS dəqiqliyi"><Crosshair size={12} /> GPS ±{Math.round(Number(l.accuracy_m))} m</span>
                      : coordChanged && <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 font-semibold text-muted" title="Koordinat əl ilə yazılıb (GPS yoxlaması olmadan)"><PenLine size={12} /> Əl ilə yazılıb</span>}
                    {l.new_lat != null && l.new_lng != null && (
                      <a href={mapSearchUrl({ lat: l.new_lat, lng: l.new_lng, address: null })} target="_blank" rel="noreferrer" className="link inline-flex items-center gap-1">
                        Yeni nöqtə <ExternalLink size={11} />
                      </a>
                    )}
                    {l.old_lat != null && l.old_lng != null && coordChanged && (
                      <a href={mapSearchUrl({ lat: l.old_lat, lng: l.old_lng, address: null })} target="_blank" rel="noreferrer" className="link inline-flex items-center gap-1 text-muted">
                        Köhnə nöqtə <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </>
  );
}
