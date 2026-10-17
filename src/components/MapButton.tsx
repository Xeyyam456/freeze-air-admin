
import { useState } from "react";
import { ExternalLink, Map as MapIcon, MapPin, X } from "lucide-react";
import { mapEmbedUrl, mapSearchUrl } from "@/lib/navigation";
// Xəritədə göstərilən yer: filial/mağaza və ya sabit məkanlı şirkət
export type Place = { code?: string | null; name: string; address: string | null; lat: number | null; lng: number | null };
import { Modal } from "./Modal";

export function MapButton({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  const hasLocation = (place.lat != null && place.lng != null) || !!place.address;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={!hasLocation}
        className="btn btn-soft btn-sm" title={hasLocation ? undefined : "Nə ünvan, nə koordinat yazılıb"}>
        <MapIcon size={14} /> Xəritədə göstər
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="map-title" className="!max-w-4xl overflow-hidden !p-0">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="min-w-0">
              <h2 id="map-title" className="flex items-center gap-2 text-lg font-bold">
                {place.code && <span className="code-badge">{place.code}</span>}
                <span className="truncate">{place.name}</span>
              </h2>
              <p className="muted mt-0.5 flex items-center gap-1.5 text-sm">
                <MapPin size={14} /> {place.address ?? "Ünvan yazılmayıb"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a href={mapSearchUrl(place)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                <ExternalLink size={14} /> Google Maps-də aç
              </a>
              <button type="button" onClick={() => setOpen(false)} className="icon-btn" aria-label="Bağla">
                <X size={18} />
              </button>
            </div>
          </div>
          <iframe
            src={mapEmbedUrl(place)}
            title={`${place.name} xəritədə`}
            className="block h-[520px] w-full border-t border-line"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Modal>
      )}
    </>
  );
}
