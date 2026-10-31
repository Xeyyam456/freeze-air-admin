import { ArrowRight, Crosshair, ExternalLink, PenLine } from "lucide-react";
import { mapSearchUrl } from "@/lib/navigation";
import type { LocationLogItemProps } from "@/types/clients";
import { coords, distText, meters, when } from "../../utils/locationFormat";

// Jurnalın bir qeydi: kim, nə vaxt, köhnə → yeni ünvan və koordinat, yerdəyişmə, GPS dəqiqliyi
export function LocationLogItem({ log: l, unit: u }: LocationLogItemProps) {
  const moved = l.old_lat != null && l.old_lng != null && l.new_lat != null && l.new_lng != null
    ? meters(l.old_lat, l.old_lng, l.new_lat, l.new_lng) : null;
  const coordChanged = l.old_lat !== l.new_lat || l.old_lng !== l.new_lng;
  const addrChanged = (l.old_address ?? "") !== (l.new_address ?? "");

  return (
    <li className="rounded-xl border border-line p-3 text-sm">
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
}
