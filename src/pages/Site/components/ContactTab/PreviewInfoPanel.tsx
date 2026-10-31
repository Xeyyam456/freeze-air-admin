import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { PreviewInfoPanelProps } from "@/types/site";

// Saytın Əlaqə səhifəsində solda tünd aurora panel: telefon, düymələr, ünvan / saat / e-poçt sətirləri. Rənglər saytın palitrasıdır.
export function PreviewInfoPanel({ phone, address, hours, email, hasWhatsApp, addressEmpty, hoursEmpty }: PreviewInfoPanelProps) {
  const rows = [
    { icon: MapPin, label: "Ünvan", value: address, empty: addressEmpty },
    { icon: Clock, label: "İş saatları", value: hours, empty: hoursEmpty },
    ...(email ? [{ icon: Mail, label: "E-poçt", value: email, empty: false }] : []),
  ];

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-[#06192b] p-5 text-white"
      style={{ backgroundImage: "radial-gradient(60% 50% at 15% 20%, rgba(0,163,217,0.35), transparent 70%), radial-gradient(50% 45% at 90% 85%, rgba(79,209,255,0.2), transparent 70%)" }}>
      <Phone size={130} strokeWidth={0.8} className="pointer-events-none absolute -right-6 -top-6 text-[#00a3d9]/10" />
      <p className="relative text-xs font-semibold text-white/60">Bizə zəng edin</p>
      <p className="relative mt-1 whitespace-nowrap text-xl font-extrabold tracking-tight">{phone}</p>
      <div className="relative mt-4 flex flex-wrap gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#00a3d9] px-3.5 text-xs font-bold text-white"><Phone size={13} /> Zəng et</span>
        {hasWhatsApp && (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 text-xs font-bold text-white"><WhatsAppIcon size={14} /> WhatsApp</span>
        )}
      </div>
      <ul className="relative mt-5 divide-y divide-white/10">
        {rows.map(({ icon: Icon, label, value, empty }) => (
          <li key={label} className="flex items-center gap-3 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#00a3d9]/15 text-[#00a3d9] ring-1 ring-[#00a3d9]/30"><Icon size={14} /></span>
            <span className="min-w-0">
              <span className="block text-[10px] text-white/50">{label}</span>
              <span className={`block truncate text-xs font-semibold ${empty ? "text-white/35" : ""}`}>{value}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
