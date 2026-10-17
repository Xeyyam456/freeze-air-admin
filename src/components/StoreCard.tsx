import { MapPin, Phone } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { MapButton } from "./MapButton";

type Props = {
  store: Tables<"stores">;
  companyName?: string;
  action?: React.ReactNode;
};

export function StoreCard({ store, companyName, action }: Props) {
  const hasCoords = store.lat != null && store.lng != null;

  return (
    <div className="store-card">
      <div className="flex gap-4">
        {/* Kod: kartın ən çox axtarılan məlumatı, ona görə ən gözə çarpan yer */}
        <span className="store-code">{store.code}</span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {companyName && <p className="muted text-xs font-semibold">{companyName}</p>}
              <h3 className="truncate text-[15px] font-bold">{store.name}</h3>
            </div>
            {action}
          </div>
          <p className="muted mt-1 flex items-start gap-1.5 text-[13px]">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">{store.address ?? "Ünvan yazılmayıb"}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px]">
            <Phone size={14} className="muted shrink-0" />
            {store.phone
              ? <a href={`tel:${store.phone}`} className="link">{store.phone}</a>
              : <span className="muted">Telefon yoxdur</span>}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-line pt-3">
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${hasCoords ? "text-ok" : "text-amber-600"}`}>
          <span className={`h-2 w-2 rounded-full ${hasCoords ? "bg-ok" : "bg-amber-500"}`} />
          {hasCoords ? "Koordinat var" : "Koordinat yoxdur"}
        </span>
        <MapButton place={store} />
      </div>
    </div>
  );
}
