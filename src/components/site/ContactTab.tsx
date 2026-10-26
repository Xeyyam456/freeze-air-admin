import { useActionState, useState } from "react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Clock, Link2, Mail, MapPin, Phone } from "lucide-react";
import { updateSiteSettings } from "@/actions/site";
import { Buttons, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

// "16.10.2026 18:41"
function formatTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Saytdakı kimi: "+994702373721" → "+994 70 237 37 21" (web/src/lib/site-settings.ts formatPhone ilə eyni)
function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  const local = d.startsWith("994") && d.length === 12 ? d.slice(3) : d.startsWith("0") && d.length === 10 ? d.slice(1) : null;
  if (!local) return phone.trim();
  return `+994 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}

// Saytda boş sahənin yerinə görünən yer tutucular (web ilə eyni)
const FALLBACK = { phone: "+994 XX XXX XX XX", address: "Bakı, ünvan yazılacaq", hours: "Hər gün, saatlar yazılacaq" };

const FIELDS = [
  { name: "phone", label: "Telefon", icon: Phone, placeholder: "+994 12 000 00 00", max: 40, type: "tel" },
  { name: "email", label: "E-poçt", icon: Mail, placeholder: "info@sirket.az", max: 120, type: "email" },
  { name: "address", label: "Ünvan", icon: MapPin, placeholder: "Bakı, Nərimanov r., ...", max: 200, type: "text", wide: true },
  { name: "hours", label: "İş saatları", icon: Clock, placeholder: "B.e.–Şənbə 09:00–19:00", max: 120, type: "text", wide: true },
  { name: "instagram_url", label: "Instagram (istəyə görə)", icon: Link2, placeholder: "https://instagram.com/sirket", max: 200, type: "url" },
  { name: "facebook_url", label: "Facebook (istəyə görə)", icon: Link2, placeholder: "https://facebook.com/sirket", max: 200, type: "url" },
] as const;

type Values = Record<(typeof FIELDS)[number]["name"], string>;

// Əlaqə məlumatları: header, footer, ana səhifə, Əlaqə və xidmət səhifələrində göstərilir
export function ContactTab() {
  const settings = useData(async () => {
    const { data } = await createClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
    return data;
  });

  if (!settings) return <div className="card muted">Yüklənir...</div>;
  // key: saxlandıqdan sonra sahələr bazadakı yeni dəyərlərlə yenilənsin
  return <ContactEditor key={settings.updated_at} settings={settings} />;
}

function ContactEditor({ settings }: { settings: Tables<"site_settings"> }) {
  const [state, action, pending] = useActionState(updateSiteSettings, null);
  useOnSuccess(state, undefined, "Əlaqə məlumatları yadda saxlanıldı");
  const [values, setValues] = useState<Values>({
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    hours: settings.hours ?? "",
    instagram_url: settings.instagram_url ?? "",
    facebook_url: settings.facebook_url ?? "",
  });

  const phone = values.phone.trim() ? formatPhone(values.phone) : FALLBACK.phone;
  const address = values.address.trim() || FALLBACK.address;
  const hours = values.hours.trim() || FALLBACK.hours;
  const hasWhatsApp = values.phone.replace(/\D/g, "").length >= 11;
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed&hl=az`;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
      {/* Form */}
      <div className="card flex flex-col">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="card-title">Əlaqə məlumatları</h2>
            <p className="muted mt-1 text-sm">Boş qalan sahənin yerində saytda yer tutucu görünür. Sağda yazdıqca dəyişən önizləmə var.</p>
          </div>
          <span className="muted rounded-full max-sm:max-w-full max-sm:whitespace-normal sm:shrink-0 bg-bg px-3 py-1 text-xs">Son dəyişiklik: {formatTime(settings.updated_at)}</span>
        </div>

        <SaveConfirmForm action={action} className="mt-6 flex flex-1 flex-col">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(({ name, label, icon: Icon, placeholder, max, type, ...rest }) => (
              <label key={name} className={`block ${"wide" in rest ? "sm:col-span-2" : ""}`}>
                <span className="label">{label}</span>
                <span className="relative block">
                  <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input name={name} type={type} value={values[name]} placeholder={placeholder} maxLength={max}
                    onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                    className="field !pl-10" />
                </span>
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-bg p-4">
            <p className="text-xs font-semibold">Saytda harada görünür</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Footer (bütün səhifələr; sosial linklər yalnız footer-də)", "Ana səhifə: sürətli əlaqə və xəritə", "Əlaqə səhifəsi", "Xidmət səhifələri: zəng bloku"].map((p) => (
                <span key={p} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">{p}</span>
              ))}
            </div>
            <p className="muted mt-3 text-[11px]">WhatsApp düyməsi telefon mobil formatdadırsa (ən azı 11 rəqəm, məs. +994 70…) çıxır.</p>
          </div>

          <div className="mt-auto pt-6">
            <Buttons pending={pending} label="Yadda saxla" />
          </div>
        </SaveConfirmForm>
      </div>

      {/* Canlı önizləmə: saytdakı Əlaqə səhifəsinin görünüşü */}
      <div className="card !p-4">
        <p className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ok" /> Saytda belə görünəcək
        </p>
        {/* Saytın yeni Əlaqə səhifəsi (2026-10-20): solda tünd aurora panel (telefon, düymələr, ünvan / saat / e-poçt sətirləri),
            sağda "Bizə yazın" forması, aşağıda xəritə (ortada döyünən nişan + "Marşrut qur"). Rənglər saytın palitrasıdır. */}
        <div className="grid gap-3 rounded-2xl bg-[#eaf3f8] p-3 lg:grid-cols-[1fr_1.05fr]">
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
              {[
                { icon: MapPin, label: "Ünvan", value: address, empty: !values.address.trim() },
                { icon: Clock, label: "İş saatları", value: hours, empty: !values.hours.trim() },
                ...(values.email.trim() ? [{ icon: Mail, label: "E-poçt", value: values.email.trim(), empty: false }] : []),
              ].map(({ icon: Icon, label, value, empty }) => (
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

          <div className="relative overflow-hidden rounded-2xl bg-white lg:col-span-2">
            <iframe src={mapUrl} title={`Xəritə: ${address}`} className="h-56 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#00a3d9]/40" />
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#00a3d9] text-white ring-[3px] ring-white"><MapPin size={16} /></span>
            </span>
            <span className="pointer-events-none absolute bottom-3 left-1/2 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#00a3d9] px-3.5 text-xs font-bold text-white shadow-lg">Marşrut qur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
