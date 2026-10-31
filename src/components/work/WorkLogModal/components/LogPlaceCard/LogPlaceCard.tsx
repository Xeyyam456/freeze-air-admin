import { Home, MapPin } from "lucide-react";
import { MapButton } from "@/components/MapButton";
import type { LogPartProps, LogPlace } from "@/types/workLogs";

// Harada: şirkət, mağaza/filial (kodu ilə) və ya siyahıda olmayan yer; ünvan, xəritə düyməsi
export function LogPlaceCard({ log }: LogPartProps) {
  const owner = log.stores?.companies?.name ?? log.companies?.name ?? null;
  const placeName = log.stores ? log.stores.name : log.companies ? log.companies.name : log.place_text ?? "Yer silinib";
  const place: LogPlace | null = log.stores
    ? { code: log.stores.code, name: `${owner ?? ""} · ${log.stores.name}`, address: log.stores.address, lat: log.stores.lat, lng: log.stores.lng }
    : log.companies
      ? { name: log.companies.name, address: log.companies.address, lat: log.companies.lat, lng: log.companies.lng }
      : null;
  return (
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
      {/* Mobildə xəritə düyməsi yoxdur (adı sıxışdırırdı; istifadəçi qərarı) */}
      {place && <span className="max-sm:hidden"><MapButton place={place} /></span>}
    </div>
  );
}
