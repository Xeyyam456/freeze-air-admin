import { useActionState, useRef, useState } from "react";
import { CircleCheck, ClipboardCheck, ImagePlus, Phone, PhoneCall, Snowflake, Trash2 } from "lucide-react";
import { saveHeroForm, updateAbout, updateHomeImage, type HomeImageField } from "@/actions/site";
import { removeSiteImage, uploadSiteImage } from "@/actions/siteContent";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { toast } from "@/lib/toast";

const SITE_DELAY = "Saytda ən gec 1 dəqiqəyə görünəcək.";

// "Haqqımızda" kartının rəngləri (saytın palitrası: web/src/app/globals.css və web page.tsx CARD_COLORS)
const CARD_COLORS = [
  { id: "night", label: "Tünd", bg: "#06192b", fg: "#ffffff", icon: "#00a3d9", sub: "rgba(255,255,255,0.6)" },
  { id: "cold", label: "Göy", bg: "#00a3d9", fg: "#ffffff", icon: "#ffffff", sub: "rgba(255,255,255,0.75)" },
  { id: "ice", label: "Açıq mavi", bg: "#cfe8f3", fg: "#06192b", icon: "#00a3d9", sub: "rgba(6,25,43,0.6)" },
  { id: "white", label: "Ağ", bg: "#ffffff", fg: "#06192b", icon: "#00a3d9", sub: "rgba(6,25,43,0.6)" },
];

// Hero-dakı sürətli müraciət formunun standart mətnləri (web/src/lib/site-texts.ts ilə eyni)
const QUICK_DEFAULTS = {
  "home.quick.name": "Adınız",
  "home.quick.phone": "Telefon nömrəniz",
  "home.quick.button": "Zəng sifariş et",
  "home.quick.note": "Nömrənizi yazın, sizə özümüz zəng edək.",
  "home.quick.or": "Və ya zəng edin",
} as const;
type QuickKey = keyof typeof QUICK_DEFAULTS;
const QUICK_FIELDS: { key: QuickKey; label: string; max: number }[] = [
  { key: "home.quick.name", label: "Ad sahəsinin yazısı", max: 40 },
  { key: "home.quick.phone", label: "Telefon sahəsinin yazısı", max: 40 },
  { key: "home.quick.button", label: "Düymənin yazısı", max: 30 },
  { key: "home.quick.note", label: "Formun altındakı yazı", max: 120 },
  { key: "home.quick.or", label: "Telefon nömrəsinin yanındakı yazı", max: 40 },
];

// Ana səhifənin və saytın idarə olunan hissələri: loqo, hero şəkli və "Haqqımızda" bölməsi.
// Hər bölmənin yanında saytdakı görünüşünün kiçik önizləməsi var.
export function HomeTab() {
  const data = useData(async () => {
    const supabase = createClient();
    const [{ data: settings }, { data: texts }] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("site_texts").select("key, value").in("key", ["brand.name", "brand.tagline", "header.cta", "home.hero.title", ...Object.keys(QUICK_DEFAULTS)]),
    ]);
    const t = Object.fromEntries((texts ?? []).map((r) => [r.key, r.value])) as Record<string, string | undefined>;
    return { settings, t };
  });

  if (!data?.settings) return <div className="card muted">Yüklənir...</div>;
  const { settings, t } = data;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(320px,400px)_1fr]">
        {/* Loqo + header önizləməsi */}
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

        {/* Hero: saytdakı kimi tam enli fon şəkli, soldan tünd keçid, üstündə başlıq və sürətli forma */}
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="card-title">Hero şəkli</h2>
              <p className="muted mt-1 text-sm">Saytın ən üstündə bütün ekranı tutan fon şəkli. Solda mətn və forma durur: kondisioner və vacib detal sağ yuxarıda olsun.</p>
            </div>
            <span className="muted rounded-full bg-bg px-3 py-1 text-xs">Tövsiyə: 16:9, 1920×1080 px</span>
          </div>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-[#06192b] via-[#0b3a5c] to-[#00a3d9]">
              {settings.hero_image_url && <img src={settings.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />}
              <span className="absolute inset-0 bg-gradient-to-r from-[#06192b]/90 via-[#06192b]/60 to-[#06192b]/10" />
              <div className="absolute inset-y-0 left-0 flex w-3/5 flex-col justify-center gap-2 p-5 text-white">
                <span className="h-1.5 w-16 rounded-full bg-white/30" />
                <span className="text-lg font-extrabold leading-tight">{t["home.hero.title"] ?? "Kondisioner təmiri və servisi"}</span>
                <span className="h-1.5 w-4/5 rounded-full bg-white/25" />
                <span className="mt-1 flex gap-1 rounded-xl bg-white/10 p-1 ring-1 ring-white/20">
                  <span className="h-5 flex-1 rounded-md bg-white" /><span className="h-5 flex-1 rounded-md bg-white" /><span className="h-5 w-12 rounded-md bg-[#ff9f1c]" />
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4">
              <ul className="space-y-2.5 text-sm">
                {[
                  "Şəkil bütün ekranı örtür; ekran nisbətinə görə aşağı hissəsi kəsilə bilər.",
                  "Şəklin sol tərəfi mətn oxunsun deyə tündləşdirilir.",
                  "Kondisionerin üstündə saytda hava axını animasiyası oynayır.",
                  "Şəkil yoxdursa, saytda tünd mavi fon görünür.",
                ].map((x) => (
                  <li key={x} className="flex gap-2"><CircleCheck size={16} className="mt-0.5 shrink-0 text-primary" /> <span className="muted">{x}</span></li>
                ))}
              </ul>
              <ImageSlot field="hero_image_url" url={settings.hero_image_url} folder="hero" hideImage hint="" />
            </div>
          </div>
        </section>
      </div>

      <HeroFormCard enabled={settings.hero_form_enabled} phone={settings.phone ?? ""} t={t} />

      {/* Haqqımızda: şəkillər | mətn | siyahı + kart */}
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="card-title">Haqqımızda</h2>
            <p className="muted mt-1 text-sm">Hero-dan sonrakı bölmə: saytda solda şəkillər və kart, sağda mətn.</p>
          </div>
          <span className="muted rounded-full bg-bg px-3 py-1 text-xs">Şəkillər yüklənən kimi saxlanır, mətnlər “Yadda saxla” ilə</span>
        </div>
        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(300px,1fr)_2fr]">
          <div className="space-y-4">
            <div>
              <span className="label">Böyük şəkil (yuxarıda)</span>
              <ImageSlot field="about_image_main_url" url={settings.about_image_main_url} folder="about" hint="16:9, məs. 1600×900 px." />
            </div>
            <div>
              <span className="label">Kiçik şəkil (kartın yanında)</span>
              <ImageSlot field="about_image_side_url" url={settings.about_image_side_url} folder="about" hint="Kvadrat, məs. 800×800 px." small />
            </div>
          </div>
          <AboutForm key={settings.updated_at} settings={settings} />
        </div>
      </section>
    </div>
  );
}

// Hero-dakı sürətli müraciət: açıb-bağlamaq və mətnləri dəyişmək. Müraciətlər "Müraciətlər" səhifəsinə düşür.
function HeroFormCard({ enabled: initialEnabled, phone, t }: { enabled: boolean; phone: string; t: Record<string, string | undefined> }) {
  const initial = Object.fromEntries(QUICK_FIELDS.map((f) => [f.key, t[f.key] || QUICK_DEFAULTS[f.key]])) as Record<QuickKey, string>;
  const [enabled, setEnabled] = useState(initialEnabled);
  const [values, setValues] = useState<Record<QuickKey, string>>(initial);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    // Standart mətnlə eyni olan sahə boş saxlanır: saytda standart göstərilir
    const texts = Object.fromEntries(QUICK_FIELDS.map((f) => [f.key, values[f.key].trim() === QUICK_DEFAULTS[f.key] ? "" : values[f.key].trim()]));
    const err = await saveHeroForm(enabled, texts);
    setPending(false);
    if (err) return toast.error(err);
    toast.success("Sürətli müraciət yadda saxlanıldı", SITE_DELAY);
  }

  const v = (k: QuickKey) => values[k].trim() || QUICK_DEFAULTS[k];

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="card-title">Sürətli müraciət formu</h2>
          <p className="muted mt-1 text-sm">Hero-da başlığın altında: ad və telefon yazılır, müraciət “Müraciətlər” səhifəsinə düşür. Telefon nömrəsi “Əlaqə” tabından götürülür.</p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
          Saytda göstər
        </label>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className={`grid gap-4 sm:grid-cols-2 ${enabled ? "" : "opacity-50"}`}>
          {QUICK_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input value={values[f.key]} maxLength={f.max} disabled={!enabled} onChange={(e) => setValues((x) => ({ ...x, [f.key]: e.target.value }))}
                className={`field ${f.key === "home.quick.note" ? "sm:col-span-2" : ""}`} />
            </Field>
          ))}
          <p className="muted text-xs sm:col-span-2">Sahəni boş qoysan, saytda standart yazı çıxır.</p>
        </div>

        {/* Saytdakı kimi canlı önizləmə */}
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
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={save} disabled={pending} className="btn btn-primary min-w-40">{pending ? "Gözləyin..." : "Yadda saxla"}</button>
      </div>
    </section>
  );
}

// key (yuxarıda): saxlandıqdan sonra sahələr bazadakı yeni dəyərlərlə yenilənsin
function AboutForm({ settings }: { settings: Tables<"site_settings"> }) {
  const [state, action, pending] = useActionState(updateAbout, null);
  useOnSuccess(state, undefined, "Haqqımızda mətni yadda saxlanıldı");
  const [cardTitle, setCardTitle] = useState(settings.about_card_title ?? "");
  const [cardText, setCardText] = useState(settings.about_card_text ?? "");
  const [color, setColor] = useState(settings.about_card_color);
  const c = CARD_COLORS.find((x) => x.id === color) ?? CARD_COLORS[0];

  return (
    <SaveConfirmForm action={action} className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Başlıq">
          <input name="about_title" defaultValue={settings.about_title ?? ""} maxLength={120} className="field" />
        </Field>
        <Field label="Mətn (abzasları boş sətirlə ayırın)">
          <textarea name="about_text" defaultValue={settings.about_text ?? ""} maxLength={1500} rows={9} className="field resize-y !py-2" />
        </Field>
        <Field label="Siyahı (hər sətir bir bənd)">
          <textarea name="about_points" defaultValue={settings.about_points ?? ""} maxLength={500} rows={3} className="field resize-y !py-2" />
        </Field>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kart: başlıq">
            <input name="about_card_title" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} maxLength={60} className="field" />
          </Field>
          <Field label="Kart: alt yazı">
            <input name="about_card_text" value={cardText} onChange={(e) => setCardText(e.target.value)} maxLength={80} className="field" />
          </Field>
        </div>
        <fieldset>
          <legend className="label">Kartın rəngi</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CARD_COLORS.map((x) => (
              <label key={x.id} className="cursor-pointer">
                <input type="radio" name="about_card_color" value={x.id} checked={color === x.id} onChange={() => setColor(x.id)} className="peer sr-only" />
                <span className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                  <span className="h-5 w-5 shrink-0 rounded-md border border-line" style={{ background: x.bg }} />
                  {x.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Kartın canlı önizləməsi: saytdakı kimi */}
        <div className="rounded-2xl bg-[#eaf3f8] p-4">
          <p className="mb-2 text-[11px] font-semibold text-muted">Kart saytda belə görünəcək</p>
          <div className="flex max-w-xs flex-col justify-center rounded-[22px] p-5 shadow-sm" style={{ background: c.bg, color: c.fg }}>
            <ClipboardCheck size={26} style={{ color: c.icon }} />
            <p className="mt-3 text-base font-extrabold">{cardTitle || "Hər iş qeydə alınır"}</p>
            {cardText && <p className="mt-1 text-xs" style={{ color: c.sub }}>{cardText}</p>}
          </div>
        </div>

        <div className="mt-auto">
          <Buttons pending={pending} label="Yadda saxla" />
        </div>
      </div>
    </SaveConfirmForm>
  );
}

// Şəkil yeri: yüklənən kimi bazaya yazılır, köhnə şəkil silinir. Şəkil kəsilmir (öz nisbətində).
// compact: kiçik önizləmə (loqo); hideImage: yalnız düymələr (şəkil başqa yerdə önizlənir).
function ImageSlot({ field, url, folder, hint, small = false, compact = false, hideImage = false, empty = "Şəkil yoxdur: saytda illüstrasiya göstərilir" }: {
  field: HomeImageField;
  url: string | null;
  folder: string;
  hint: string;
  small?: boolean;
  compact?: boolean;
  hideImage?: boolean;
  empty?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const next = await uploadSiteImage(file, folder);
      const err = await updateHomeImage(field, next);
      if (err) {
        await removeSiteImage(next);
        toast.error(err);
      } else {
        await removeSiteImage(url);
        toast.success("Şəkil yadda saxlanıldı", SITE_DELAY);
      }
    } catch {
      toast.error("Şəkil yüklənmədi. JPG, PNG və ya WebP olmalıdır.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onRemove() {
    const err = await updateHomeImage(field, null);
    if (err) return toast.error(err);
    await removeSiteImage(url);
    toast.success("Şəkil silindi", SITE_DELAY);
  }

  return (
    <div className={small ? "max-w-xs" : ""}>
      {!hideImage && (
        <div className={`grid place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-bg ${compact ? "min-h-24 p-3" : small ? "min-h-32" : "min-h-44"}`}>
          {url
            ? <img src={url} alt="" className={`block ${compact ? "max-h-20 w-auto" : "h-auto w-full"} ${uploading ? "opacity-50" : ""}`} />
            : <span className="muted px-4 text-center text-xs">{uploading ? "Yüklənir..." : empty}</span>}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      <div className={`flex flex-wrap items-center gap-2 ${hideImage ? "" : "mt-2"}`}>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-secondary btn-sm">
          <ImagePlus size={14} /> {uploading ? "Yüklənir..." : url ? "Dəyiş" : "Yüklə"}
        </button>
        {url && !uploading && (
          <ConfirmButton onConfirm={onRemove} title="Şəkli sil" success={false} className="icon-btn icon-btn-danger !h-8"
            question="Şəkil silinəcək, saytda yenidən ikon və ya illüstrasiya göstəriləcək.">
            <Trash2 size={15} />
          </ConfirmButton>
        )}
        {hint && <span className="muted text-[11px]">{hint}</span>}
      </div>
    </div>
  );
}
