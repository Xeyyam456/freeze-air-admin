import { Snowflake } from "lucide-react";
import type { HomeCardProps } from "@/types/site";
import { ImageSlot } from "./ImageSlot";

// Loqo + header önizləməsi
export function LogoCard({ settings, t }: HomeCardProps) {
  return (
    <section className="card flex flex-col">
      <h2 className="card-title">Loqo</h2>
      <p className="muted mt-1 text-sm">Saytın bütün səhifələrində: header-də şirkət adının solunda və footer-də.</p>
      {/* Saytın yeni header-i (2026-10-20): bir sətir, şüşə ağ fon; solda loqo, sağda tünd "Usta çağır" (menyu həbləri dar kartda sığmadığı üçün göstərilmir) */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <div className="flex h-16 items-center gap-3 bg-white/90 px-4">
          {settings.logo_url
            ? <img src={settings.logo_url} alt="" className="h-9 w-auto max-w-[100px] object-contain" />
            : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#00a3d9] to-[#06192b] text-white shadow-[0_6px_14px_rgba(0,163,217,0.35)]"><Snowflake size={18} /></span>}
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-extrabold text-[#06192b]">{t["brand.name"] ?? "Freeze Air Service"}</span>
            <span className="block truncate text-[10px] text-[#06192b]/50">{t["brand.tagline"] ?? ""}</span>
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-[#06192b] px-3 py-1.5 text-[10px] font-bold text-white">{t["header.cta"] ?? "Usta çağır"}</span>
        </div>
      </div>
      <p className="muted mb-4 mt-1.5 text-[11px]">Header önizləməsi</p>
      <div className="mt-auto">
        <ImageSlot field="logo_url" url={settings.logo_url} folder="logo" compact
          empty="Loqo yoxdur: saytda qar dənəsi ikonu göstərilir"
          hint="Şəffaf fonlu PNG, hündürlüyü ən azı 200 px." />
      </div>
    </section>
  );
}
