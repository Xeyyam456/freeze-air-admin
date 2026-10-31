import { Phone, PhoneCall } from "lucide-react";
import type { HeroFormPreviewProps } from "@/types/site";

// Saytdakı kimi canlı önizləmə
export function HeroFormPreview({ enabled, phone, v }: HeroFormPreviewProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#06192b] via-[#0b3a5c] to-[#00a3d9] p-6 sm:p-8">
      {enabled ? (
        <>
          <div className="flex flex-wrap gap-2 rounded-[22px] bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur">
            <span className="min-w-[110px] flex-1 rounded-xl bg-white px-3.5 py-2.5 text-sm text-[#06192b]/40">{v("home.quick.name")}</span>
            <span className="min-w-[130px] flex-1 rounded-xl bg-white px-3.5 py-2.5 text-sm text-[#06192b]/40">{v("home.quick.phone")}</span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff9f1c] px-4 py-2.5 text-sm font-bold text-[#06192b]"><PhoneCall size={15} /> {v("home.quick.button")}</span>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-white/65">
            <span>{v("home.quick.note")}</span>
            {phone.trim() && <><span className="text-white/30">·</span><span>{v("home.quick.or")}:</span><span className="inline-flex items-center gap-1 font-bold text-white"><Phone size={12} /> {phone.trim()}</span></>}
          </p>
        </>
      ) : (
        <p className="py-6 text-center text-sm font-semibold text-white/70">Forma gizlidir: saytda hero-da yalnız mətn və keçidlər görünür.</p>
      )}
    </div>
  );
}
