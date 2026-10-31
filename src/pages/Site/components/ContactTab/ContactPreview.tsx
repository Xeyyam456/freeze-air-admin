import { Mail, Phone } from "lucide-react";
import type { ContactPreviewProps } from "@/types/site";
import { CONTACT_FALLBACK } from "../../constants/contactFields";
import { formatPhone } from "../../utils/contactFormat";
import { PreviewInfoPanel } from "./PreviewInfoPanel";
import { PreviewMap } from "./PreviewMap";

// Canlı önizləmə: saytdakı Əlaqə səhifəsinin görünüşü (2026-10-20 yeni dizayn)
export function ContactPreview({ values }: ContactPreviewProps) {
  const phone = values.phone.trim() ? formatPhone(values.phone) : CONTACT_FALLBACK.phone;
  const address = values.address.trim() || CONTACT_FALLBACK.address;
  const hours = values.hours.trim() || CONTACT_FALLBACK.hours;
  const hasWhatsApp = values.phone.replace(/\D/g, "").length >= 11;

  return (
    <div className="card !p-4">
      <p className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-ok" /> Saytda belə görünəcək
      </p>
      <div className="grid gap-3 rounded-2xl bg-[#eaf3f8] p-3 lg:grid-cols-[1fr_1.05fr]">
        <PreviewInfoPanel phone={phone} address={address} hours={hours} email={values.email.trim()} hasWhatsApp={hasWhatsApp}
          addressEmpty={!values.address.trim()} hoursEmpty={!values.hours.trim()} />

        {/* Forma (yalnız görünüş) */}
        <div className="flex flex-col rounded-2xl bg-white p-5 text-[#06192b]">
          <p className="text-base font-extrabold">Bizə yazın</p>
          <p className="mt-0.5 text-[11px] text-[#06192b]/55">Mesajınızı yazın, sizə özümüz zəng edək.</p>
          <div className="mt-4 grid flex-1 content-start gap-2">
            {[Phone, Mail].map((Icon, i) => (
              <span key={i} className="flex h-9 items-center gap-2 rounded-xl border border-[#06192b]/10 bg-[#eaf3f8]/70 px-3 text-[#06192b]/35"><Icon size={13} /><span className="h-1.5 w-20 rounded bg-[#06192b]/10" /></span>
            ))}
            <span className="h-16 rounded-xl border border-[#06192b]/10 bg-[#eaf3f8]/70" />
          </div>
          <span className="mt-3 flex h-9 items-center justify-center rounded-xl bg-[#06192b] text-xs font-bold text-white">Göndər</span>
        </div>

        <PreviewMap address={address} />
      </div>
    </div>
  );
}
