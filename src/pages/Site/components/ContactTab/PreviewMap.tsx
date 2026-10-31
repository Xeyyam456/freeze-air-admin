import { MapPin } from "lucide-react";
import type { PreviewMapProps } from "@/types/site";

// Xəritə (ortada döyünən nişan + "Marşrut qur")
export function PreviewMap({ address }: PreviewMapProps) {
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed&hl=az`;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white lg:col-span-2">
      <iframe src={mapUrl} title={`Xəritə: ${address}`} className="h-56 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#00a3d9]/40" />
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#00a3d9] text-white ring-[3px] ring-white"><MapPin size={16} /></span>
      </span>
      <span className="pointer-events-none absolute bottom-3 left-1/2 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#00a3d9] px-3.5 text-xs font-bold text-white shadow-lg">Marşrut qur</span>
    </div>
  );
}
