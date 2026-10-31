import { MapPin } from "lucide-react";
import { mapEmbedUrl } from "@/lib/navigation";
import type { LocationViewProps } from "@/types/clients";

// Filialı olmayan (sabit məkanlı) şirkət: siyahı əvəzinə yeri böyük xəritədə
export function LocationView({ company }: LocationViewProps) {
  const hasLocation = (company.lat != null && company.lng != null) || !!company.address;

  if (!hasLocation) {
    return (
      <div className="card flex h-full flex-col items-center justify-center text-center">
        <span className="icon-tile"><MapPin size={20} /></span>
        <p className="mt-3 font-semibold">Ünvan yazılmayıb</p>
        <p className="muted text-sm">Sağ paneldəki redaktə düyməsi ilə şirkətin ünvanını və koordinatını daxil et.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-line bg-surface">
      <iframe
        src={mapEmbedUrl(company)}
        title={`${company.name} xəritədə`}
        className="block h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
