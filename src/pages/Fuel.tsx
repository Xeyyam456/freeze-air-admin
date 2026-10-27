import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Fuel, HandCoins, ImageIcon, MoonStar, Save, SunMedium, Trash2, X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { DatePicker } from "@/components/DatePicker";
import { Modal } from "@/components/Modal";
import { Page } from "@/components/Page";
import { Avatar } from "@/components/employees/EmployeeForms";
import { MONTHS_AZ, todayBaku } from "@/lib/attendance";
import type { Tables } from "@/lib/database.types";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";

type Row = Tables<"mileage_logs">;
type Payment = Tables<"fuel_payments">;
type Period = "day" | "week" | "month";

const azn = (n: number) => `${n.toFixed(2)} ₼`;
// Yanacaq növü (0079)
export const FUEL_TYPES = { petrol: "Benzin", diesel: "Dizel" } as const;
type FuelType = keyof typeof FUEL_TYPES;
const fuelLabel = (t: string | null) => (t && t in FUEL_TYPES ? FUEL_TYPES[t as FuelType] : null);
const timeBaku = (iso: string) =>
  new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

// Tarix köməkçiləri ("YYYY-MM-DD", UTC günorta ilə: saat qurşağı sürüşməsin)
const d12 = (iso: string) => new Date(`${iso}T12:00:00Z`);
const isoOf = (d: Date) => d.toISOString().slice(0, 10);
function addDays(iso: string, n: number) { const d = d12(iso); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); }
function addMonths(iso: string, n: number) { const d = d12(`${iso.slice(0, 7)}-01`); d.setUTCMonth(d.getUTCMonth() + n); return isoOf(d); }
// 2026-10-25 → 25.10.2026 (cədvəllərdə kiçik yazılır)
const numDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
const dayName = (iso: string) => `${Number(iso.slice(8))} ${MONTHS_AZ[Number(iso.slice(5, 7)) - 1]}`;

// Dövrün aralığı və adı: gün; həftə = şirkətin iş həftəsi, 6 gün (bazar ertəsi – şənbə, bazar istirahət); ay.
// workdays: dövrdəki iş günlərinin sayı (bazarsız), "5 / 6 iş günü" yazmaq üçün
function rangeOf(period: Period, anchor: string) {
  if (period === "day") return { from: anchor, to: anchor, label: dayName(anchor), short: numDate(anchor), full: numDate(anchor), workdays: 1 };
  if (period === "week") {
    const from = addDays(anchor, -((d12(anchor).getUTCDay() + 6) % 7));
    const to = addDays(from, 5);
    const same = from.slice(5, 7) === to.slice(5, 7);
    return { from, to, label: same ? `${Number(from.slice(8))}–${dayName(to)}` : `${dayName(from)} – ${dayName(to)}`, short: `${numDate(from).slice(0, 5)} – ${numDate(to)}`, full: `${numDate(from)} – ${numDate(to)}`, workdays: 6 };
  }
  const from = `${anchor.slice(0, 7)}-01`;
  const to = addDays(addMonths(from, 1), -1);
  let workdays = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (d12(d).getUTCDay() !== 0) workdays++;
  return { from, to, label: `${MONTHS_AZ[Number(anchor.slice(5, 7)) - 1]} ${anchor.slice(0, 4)}`, short: `${MONTHS_AZ[Number(anchor.slice(5, 7)) - 1]} ${anchor.slice(0, 4)}`, full: `${MONTHS_AZ[Number(anchor.slice(5, 7)) - 1]} ${anchor.slice(0, 4)}`, workdays };
}
const PERIOD_LABEL: Record<Period, string> = { day: "Gün", week: "Həftə", month: "Ay" };
const PERIOD_TOTAL: Record<Period, string> = { day: "Günün yanacaq pulu", week: "Həftənin yanacaq pulu", month: "Ayın yanacaq pulu" };

// mFrom..mTo: seçilmiş dövrün ayı — balans aylıq hesablanır (istifadəçi: "hər ayın öz hesabı olacaq")
async function fetchFuel(from: string, to: string, today: string, mFrom: string, mTo: string) {
  const supabase = createClient();
  const [{ data: cars }, { data: logs }, { data: todayLogs }, { data: settings }, { data: payments }, { data: mCost }, { data: mPaid }] = await Promise.all([
    supabase.from("employees").select("id, full_name, photo_url, car_plate, car_model, fuel_per_100, fuel_type").eq("has_car", true).eq("is_active", true).order("full_name"),
    supabase.from("mileage_logs").select("*").gte("day", from).lte("day", to).order("day", { ascending: false }),
    // Bu günün hesabatı dövrdən asılı olmayaraq həmişə göstərilir
    supabase.from("mileage_logs").select("*").eq("day", today),
    supabase.from("fuel_settings").select("petrol_price, diesel_price").eq("id", 1).maybeSingle(),
    // Yanacaq pulunun ödənişləri (0080): dövrün siyahısı + ayın balansı (ayda verilən − ayda sərf)
    supabase.from("fuel_payments").select("*").gte("day", from).lte("day", to).order("day", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("mileage_logs").select("employee_id, cost").gte("day", mFrom).lte("day", mTo).not("cost", "is", null),
    supabase.from("fuel_payments").select("employee_id, amount").gte("day", mFrom).lte("day", mTo),
  ]);
  const month = new Map<number, { cost: number; paid: number }>(); // usta → ayın sərfi və verilən
  const m = (id: number) => month.get(id) ?? (month.set(id, { cost: 0, paid: 0 }), month.get(id)!);
  for (const r of mCost ?? []) m(r.employee_id).cost += Number(r.cost);
  for (const p of mPaid ?? []) m(p.employee_id).paid += Number(p.amount);
  return {
    cars: cars ?? [], logs: logs ?? [], todayLogs: todayLogs ?? [], payments: payments ?? [], month,
    prices: { petrol: settings?.petrol_price ?? null, diesel: settings?.diesel_price ?? null },
  };
}

// Qapalı "mileage" bucket-indəki spidometr şəkli: "Şəkilə bax" düyməsi basanda imzalı linklə pəncərədə açılır
function PhotoLink({ path, label }: { path: string | null; label: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !path) return;
    let cancelled = false;
    createClient().storage.from("mileage").createSignedUrl(path, 3600).then(({ data }) => { if (!cancelled) setUrl(data?.signedUrl ?? null); });
    return () => { cancelled = true; };
  }, [open, path]);
  if (!path) return <span className="muted inline-flex items-center gap-1 text-[11px]" title={`${label}: şəkil yoxdur`}><ImageIcon size={12} /> Şəkil yoxdur</span>;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-primary-soft px-2 py-1 text-[11px] font-semibold text-primary hover:brightness-95">
        <ImageIcon size={12} /> Şəkilə bax
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="km-photo-title" className="!max-w-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="km-photo-title" className="flex items-center gap-2 text-lg font-bold"><ImageIcon size={18} className="text-primary" /> Spidometr · {label}</h2>
            <button type="button" onClick={() => setOpen(false)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          {url
            ? <img src={url} alt={`Spidometr: ${label}`} className="max-h-[70vh] w-full rounded-xl object-contain ring-1 ring-line" />
            : <div className="h-64 animate-pulse rounded-xl bg-bg" />}
        </Modal>
      )}
    </>
  );
}

// Rəqəm sahəsi + "Yadda saxla" (qiymət, 100 km-ə sərf)
function NumberSave({ value, suffix, placeholder, onSave, compact = false }: { value: number | null; suffix: string; placeholder: string; onSave: (n: number | null) => Promise<boolean>; compact?: boolean }) {
  const [text, setText] = useState(value != null ? String(value) : "");
  const [pending, setPending] = useState(false);
  const dirty = text.replace(",", ".") !== (value != null ? String(value) : "");
  async function save() {
    const t = text.replace(",", ".").trim();
    const n = t === "" ? null : Number(t);
    if (n !== null && (!Number.isFinite(n) || n <= 0)) return toast.error("Müsbət rəqəm yaz.");
    setPending(true);
    await onSave(n);
    setPending(false);
  }
  return (
    <span className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span className="relative">
        <input value={text} onChange={(e) => setText(e.target.value.replace(/[^\d.,]/g, ""))} inputMode="decimal" placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && dirty && save()}
          className={`field text-right tabular-nums ${compact ? "!h-8 w-[72px] !pl-2 !pr-6 text-sm" : "!h-9 w-28 !pr-12"}`} />
        <span className={`muted pointer-events-none absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold ${compact ? "right-2" : "right-2.5"}`}>{suffix}</span>
      </span>
      {dirty && <button type="button" onClick={save} disabled={pending} className={`btn btn-primary btn-sm ${compact ? "!h-8" : "!h-9"}`} title="Yadda saxla"><Save size={14} /></button>}
    </span>
  );
}

async function savePrice(kind: FuelType, price: number | null) {
  const { error } = await createClient().from("fuel_settings")
    .update(kind === "petrol" ? { petrol_price: price, updated_at: new Date().toISOString() } : { diesel_price: price, updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) return toast.error(error.message), false;
  // Sərf/qiymət olmadan bağlanmış günlər indi hesablanır (0078); hesablanmış köhnə günlər dəyişmir
  await createClient().rpc("mileage_fill_missing");
  toast.success(`${FUEL_TYPES[kind]} qiyməti yeniləndi`, "Yeni günlər bu qiymətlə hesablanır, köhnələr dəyişmir");
  revalidate();
  return true;
}
async function savePer100(id: number, v: number | null) {
  const { error } = await createClient().from("employees").update({ fuel_per_100: v }).eq("id", id);
  if (error) return toast.error(error.message), false;
  await createClient().rpc("mileage_fill_missing");
  toast.success("100 km-ə sərf yeniləndi");
  revalidate();
  return true;
}

// Balans = verilən − sərf: mənfi → şirkət ustaya borcludur, müsbət → artıq verilib
export function balanceText(b: number) {
  const v = Math.round(b * 100) / 100;
  if (v < 0) return { tone: "debt", text: `Şirkət ${azn(-v)} borcludur` } as const;
  if (v > 0) return { tone: "over", text: `${azn(v)} artıq verilib` } as const;
  return { tone: "even", text: "Hesab bağlıdır" } as const;
}
const BAL_CLS = { debt: "text-[#fb7185]", over: "text-amber-300", even: "text-[#4ade80]" } as const;

// Ustanın cavabı (0080): gözləyir / aldı / almadığını deyir
function PayStatus({ p }: { p: Payment }) {
  if (p.status === "received") return <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok" title={p.status_at ? `Təsdiqləyib: ${timeBaku(p.status_at)}` : undefined}><Check size={11} strokeWidth={3} /> Aldı</span>;
  if (p.status === "disputed") return <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger"><AlertTriangle size={11} /> Almadığını deyir</span>;
  return <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">Gözləyir</span>;
}

async function addPayment(employeeId: number, day: string, amount: number, note: string | null) {
  const { error } = await createClient().from("fuel_payments").insert({ employee_id: employeeId, day, amount, note });
  if (error) return toast.error(error.message), false;
  toast.success(`${azn(amount)} verildi`, "Usta «Aldım» ilə təsdiqləyəcək");
  revalidate();
  return true;
}
async function deletePayment(id: number) {
  const { error } = await createClient().from("fuel_payments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  toast.success("Ödəniş silindi");
  revalidate();
}

// "Pul ver": istənilən tarix və məbləğ (məs. həftəlik bir dəfəyə); standart məbləğ = seçilmiş dövrün borcu
function PayModal({ name, employeeId, today, suggest, onClose }: { name: string; employeeId: number; today: string; suggest: number; onClose: () => void }) {
  const [day, setDay] = useState(today);
  const [amount, setAmount] = useState(suggest > 0 ? suggest.toFixed(2) : "");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return toast.error("Məbləği yaz.");
    setPending(true);
    const ok = await addPayment(employeeId, day, Math.round(n * 100) / 100, note || null);
    setPending(false);
    if (ok) onClose();
  }
  return (
    <Modal onClose={onClose} labelledBy="pay-title" className="!max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 id="pay-title" className="flex items-center gap-2 text-lg font-bold"><HandCoins size={18} className="text-primary" /> Yanacaq pulu ver</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <p className="muted -mt-2 text-sm">{name}</p>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div>
            <span className="label">Tarix</span>
            <DatePicker value={day} max={today} required onChange={(v) => v && setDay(v)} />
          </div>
          <label className="block">
            <span className="label">Məbləğ (₼)</span>
            <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} inputMode="decimal" placeholder="250" className="field tabular-nums" />
          </label>
        </div>
        <label className="block">
          <span className="label">Qeyd <span className="muted font-normal">(istəyə görə)</span></span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="məs. həftəlik, nağd, karta" className="field" />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary"><HandCoins size={16} /> {pending ? "..." : "Verildi"}</button>
        </div>
      </form>
    </Modal>
  );
}

const sum = (rows: Row[]) => {
  const closed = rows.filter((r) => r.km !== null);
  return {
    km: closed.reduce((n, r) => n + (r.km ?? 0), 0),
    liters: closed.reduce((n, r) => n + Number(r.liters ?? 0), 0),
    cost: closed.reduce((n, r) => n + Number(r.cost ?? 0), 0),
    days: closed.length,
  };
};

// Bu günün hesabatının qısa vəziyyəti: yazılmayıb / açıq (yalnız səhər) / bağlı
function todayState(r: Row | undefined) {
  if (!r) return { tone: "muted", text: "Bu gün yazılmayıb" } as const;
  if (r.end_km == null) return { tone: "open", text: `Açıqdır · səhər ${r.start_km.toLocaleString("az")} km (${timeBaku(r.start_at)})` } as const;
  return { tone: "done", text: `${r.start_km.toLocaleString("az")} → ${r.end_km.toLocaleString("az")} km` } as const;
}

// Yanacaq (0077-0079): maşını olan ustaların gündəlik yürüşü (səhər/axşam spidometr şəkli + km).
// Başlıq seçilmiş ustanı göstərir: həmişə BU GÜNÜN hesabatı + seçilmiş dövrün (gün / həftə / ay) yanacaq pulu ayrıca.
// Kartlarda da bu günün hesabatı; qiymətlər və 100 km-ə sərf buradan yazılır (gün bağlananda sətrə yazılır, köhnə günlər dəyişmir).
export default function FuelPage() {
  const today = todayBaku();
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState(today);
  const range = rangeOf(period, anchor);
  const monthR = rangeOf("month", anchor); // balansın ayı
  const data = useData("fuel", () => fetchFuel(range.from, range.to, today, monthR.from, monthR.to), [range.from, range.to, today, monthR.from, monthR.to]);
  const [open, setOpen] = useState<number | null>(null);
  const [paysOpen, setPaysOpen] = useState<number | null>(null); // "Verilən pullar" siyahısı ayrıca açılan bölmədir (bağlı başlayır)
  const [picked, setPicked] = useState<number | null>(null); // başlıqda göstərilən usta (kartına klik)

  const shift = (dir: 1 | -1) => setAnchor((a) => {
    const next = period === "day" ? addDays(a, dir) : period === "week" ? addDays(a, 7 * dir) : addMonths(a, dir);
    return next > today ? today : next;
  });
  const atEnd = range.to >= today;

  const perCar = useMemo(() => (data?.cars ?? []).map((c) => {
    const logs = (data?.logs ?? []).filter((l) => l.employee_id === c.id);
    const payments = (data?.payments ?? []).filter((p) => p.employee_id === c.id);
    const total = sum(logs);
    const paid = payments.reduce((n, p) => n + Number(p.amount), 0);
    return {
      // balance: AYIN balansı (ayda verilən − ayda sərf); gün/həftə seçilsə də ayın borcuna görə
      car: c, logs, total, payments, paid, month: data?.month.get(c.id) ?? { cost: 0, paid: 0 },
      balance: (data?.month.get(c.id)?.paid ?? 0) - (data?.month.get(c.id)?.cost ?? 0),
      today: (data?.todayLogs ?? []).find((l) => l.employee_id === c.id),
    };
  }), [data]);
  const sel = perCar.find((c) => c.car.id === picked) ?? perCar[0] ?? null;
  const [paying, setPaying] = useState<{ id: number; name: string; suggest: number } | null>(null);
  const st = todayState(sel?.today);

  return (
    <Page title="Yanacaq" subtitle="Maşını olan ustaların yürüşü və yanacaq pulu">
      {paying && <PayModal name={paying.name} employeeId={paying.id} today={today} suggest={paying.suggest} onClose={() => setPaying(null)} />}
      {!data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <div className="space-y-4">
          {/* Tünd başlıq sürüşmədə yerində qalır (istifadəçi istəyi): üst zolağın altına yapışır, üstündəki boşluğu fon örtür; aşağı hissə sürüşür */}
          <div className="-mx-2 -mt-[var(--gap)] bg-bg px-2 pb-1 pt-[var(--gap)] xl:sticky xl:top-[var(--header-h)] xl:z-20">
            <section className="rounded-[18px] bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] p-5 text-white max-xl:p-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {sel ? (
                  <div className="flex min-w-0 items-center gap-3 max-sm:flex-wrap max-sm:gap-y-2.5">
                    <Avatar employee={sel.car} className="!h-12 !w-12 !text-sm !shadow-none ring-2 ring-white/20" />
                    <div className="min-w-0 max-sm:contents">
                      <p className="truncate text-lg font-extrabold max-sm:min-w-0 max-sm:flex-1">{sel.car.full_name}</p>
                      <p className="flex items-center gap-2 text-xs text-white/60 max-sm:basis-full max-sm:text-[11.5px] max-[400px]:flex-wrap max-[400px]:gap-y-0.5 min-[401px]:max-sm:whitespace-nowrap">
                        <span className="plate !text-[10px]">{sel.car.car_plate ?? "Nömrəsiz"}</span>
                        {sel.car.car_model ?? "Maşın"} · {fuelLabel(sel.car.fuel_type) ?? "yanacaq seçilməyib"} · {sel.car.fuel_per_100 ? `${sel.car.fuel_per_100} L / 100 km` : "sərf yazılmayıb"}
                      </p>
                    </div>
                  </div>
                ) : <p className="font-bold">Maşını olan usta yoxdur</p>}
  
                <div className="ml-auto flex flex-wrap items-center gap-2 max-sm:w-full min-[341px]:max-sm:flex-nowrap max-sm:justify-between max-sm:gap-1.5 max-[340px]:flex-wrap max-[340px]:gap-y-2">
                  <div className="flex shrink-0 gap-1 rounded-xl bg-white/10 p-1 max-sm:gap-0.5 max-[340px]:w-full" role="tablist" aria-label="Dövr">
                    {(["day", "week", "month"] as const).map((p) => (
                      <button key={p} type="button" role="tab" aria-selected={period === p} onClick={() => { setPeriod(p); setAnchor(today); }}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors max-sm:px-2.5 max-sm:py-1 max-sm:text-[13px] max-[340px]:!px-2 max-[340px]:flex-1 max-[340px]:!text-[13px] ${period === p ? "bg-white text-[#0b1324]" : "text-white/70 hover:text-white"}`}>
                        {PERIOD_LABEL[p]}
                      </button>
                    ))}
                  </div>
                  <div className="flex min-w-0 items-center gap-1 rounded-xl bg-white/10 px-1 py-1 max-sm:gap-0 max-[340px]:w-full max-[340px]:justify-between">
                    <button type="button" onClick={() => shift(-1)} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white max-[340px]:w-5" aria-label="Əvvəlki"><ChevronLeft size={16} /></button>
                    <span className="flex min-w-32 items-center justify-center gap-1.5 whitespace-nowrap text-sm font-semibold max-sm:min-w-0 max-sm:px-1 max-sm:text-[13px] max-[340px]:px-0 max-[340px]:text-[11.5px]"><CalendarDays size={14} className="text-frost max-[391px]:hidden" /> <span className="max-[391px]:hidden">{range.label}</span><span className="hidden min-[341px]:max-[391px]:inline">{range.short}</span><span className="hidden max-[340px]:inline">{range.full}</span></span>
                    <button type="button" onClick={() => shift(1)} disabled={atEnd} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 max-[340px]:w-5" aria-label="Sonrakı"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
  
              {sel && (
                <div className="mt-4 grid gap-3 max-xl:mt-3 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.35fr_1fr]">
                  {/* Bu günün hesabatı: dövr filtrindən asılı deyil */}
                  <div className="rounded-2xl bg-white/[0.07] px-5 py-4 ring-1 ring-white/10 max-xl:px-4 max-xl:py-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                      <span className={`h-2 w-2 rounded-full ${st.tone === "done" ? "bg-[#4ade80]" : st.tone === "open" ? "bg-amber-400" : "bg-white/30"}`} />
                      Bu gün · {dayName(today)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2 max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:items-baseline max-sm:gap-x-3">
                      <p className="text-3xl font-extrabold tabular-nums leading-none max-xl:text-2xl">{sel.today?.km ?? 0} <span className="text-base font-bold text-white/60">km</span></p>
                      <p className="tabular-nums text-white/80 max-sm:text-right">{sel.today?.liters != null ? `${Number(sel.today.liters).toFixed(2)} L` : "— L"}</p>
                      <p className="text-2xl font-extrabold tabular-nums text-[#4ade80] max-xl:text-xl">{sel.today?.cost != null ? azn(Number(sel.today.cost)) : "—"}</p>
                      <p className="min-w-0 truncate text-right text-[11px] text-white/60 sm:hidden">{st.text}</p>
                    </div>
                    <p className="mt-2 text-xs text-white/60 max-sm:hidden">{st.text}</p>
                  </div>
                  {/* Seçilmiş dövrün yanacaq pulu: sürülən km-ə görə */}
                  <div className="rounded-2xl bg-gradient-to-br from-frost/25 to-primary/25 px-5 py-4 ring-1 ring-frost/30 max-xl:px-4 max-xl:py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{PERIOD_TOTAL[period]} · {range.label}</p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
                      <p className="text-4xl font-extrabold tabular-nums leading-tight max-xl:text-3xl">{azn(sel.total.cost)}</p>
                      <p className="text-sm tabular-nums text-white/75">{sel.total.km.toLocaleString("az")} km · {sel.total.liters.toFixed(1)} L · {sel.total.days} / {range.workdays} iş günü</p>
                    </div>
                    {/* Ayın balansı (0080): ayda verilən − ayda sərf; gün/həftə seçilsə də ayın borcuna görə */}
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-3 text-sm max-xl:mt-2 max-xl:pt-2">
                      <div><p className="text-[11px] text-white/55">Ayda sərf</p><p className="font-extrabold tabular-nums">{azn(sel.month.cost)}</p></div>
                      <div><p className="text-[11px] text-white/55">Ayda verilən</p><p className="font-extrabold tabular-nums">{azn(sel.month.paid)}</p></div>
                      <div><p className="text-[11px] text-white/55">Ayın balansı</p><p className={`font-extrabold tabular-nums ${BAL_CLS[balanceText(sel.balance).tone]}`}>{sel.balance > 0 ? "+" : ""}{azn(sel.balance)}</p></div>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <p className={`text-xs font-semibold ${BAL_CLS[balanceText(sel.balance).tone]}`}>{balanceText(sel.balance).text} · {monthR.label}</p>
                      <button type="button" onClick={() => setPaying({ id: sel.car.id, name: sel.car.full_name, suggest: -sel.balance })}
                        className="btn btn-sm !bg-white !text-[#0b1324] hover:!bg-frost"><HandCoins size={14} /> Pul ver</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
            </div>

          {/* Hazırkı qiymətlər (benzin, dizel): yeni bağlanan günlər bununla hesablanır, köhnələr dəyişmir */}
          <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 !py-3 max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-2 max-sm:!p-3">
            <span className="flex items-center gap-2 text-sm font-bold max-sm:col-span-2 max-sm:text-[13px]"><Fuel size={16} className="text-primary" /> Yanacaq qiymətləri</span>
            {(["petrol", "diesel"] as const).map((k) => (
              <label key={k} className="flex min-w-0 items-center justify-between gap-2 text-sm max-sm:text-[13px] max-[400px]:flex-col max-[400px]:items-start max-[400px]:gap-1">
                <span className="muted font-semibold">{FUEL_TYPES[k]}</span>
                <NumberSave key={String(data.prices[k])} value={data.prices[k]} suffix="₼ / L" placeholder={k === "petrol" ? "1.00" : "1.10"} onSave={(v) => savePrice(k, v)} />
              </label>
            ))}
            <span className="muted ml-auto text-xs max-sm:col-span-2 max-sm:ml-0 max-sm:whitespace-nowrap max-sm:text-[11px] max-[360px]:text-[10px]">Qiymət dəyişəndə köhnə günlərin məbləği dəyişmir</span>
          </div>

          {data.cars.length === 0 ? (
            <div className="card py-12 text-center">
              <span className="icon-tile mx-auto"><Fuel size={20} /></span>
              <p className="mt-3 font-semibold">Maşını olan usta yoxdur</p>
              <p className="muted text-sm">Ustalar səhifəsində ustanın redaktəsində «Maşın: Var» seç və nömrəni yaz.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {perCar.map(({ car, logs, total, today: t, payments, paid }) => {
                const expanded = open === car.id;
                const s = todayState(t);
                return (
                  <li key={car.id} className={`card overflow-hidden !p-0 transition-shadow ${sel?.car.id === car.id ? "!border-primary ring-2 ring-primary-soft" : ""}`}>
                    <div className="flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 max-[391px]:relative max-sm:gap-x-3 max-sm:px-3.5" onClick={() => setPicked(car.id)}
                      title="Başlıqda bu ustanı göstər">
                      <div className="flex min-w-0 flex-[1_1_240px] items-center gap-3 max-[391px]:basis-full max-[391px]:pr-[76px] max-[340px]:pr-[66px]">
                        <Avatar employee={car} className="!h-11 !w-11 !text-xs !shadow-none max-sm:!h-10 max-sm:!w-10" />
                        <div className="min-w-0">
                          <p className="truncate font-bold">{car.full_name}</p>
                          <p className="muted flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs xl:flex-nowrap min-[471px]:max-sm:flex-nowrap max-sm:gap-x-1.5 max-sm:text-[11px] max-[340px]:text-[10.5px]">
                            <span className="plate">{car.car_plate ?? "Nömrəsiz"}</span>
                            <span className="hidden h-0 basis-full max-[391px]:block" aria-hidden="true" />
                            <span className="min-w-0 truncate min-[392px]:max-[470px]:order-last min-[392px]:max-[470px]:basis-full sm:max-xl:order-last sm:max-xl:basis-full">{car.car_model ?? "Model yazılmayıb"}</span>
                            {/* Növ ustanın məlumatında seçilir (Ustalar → redaktə); burada yalnız göstərilir */}
                            <span className={`shrink-0 whitespace-nowrap ${fuelLabel(car.fuel_type) ? "font-semibold text-ink" : "font-semibold text-danger"}`}>· {fuelLabel(car.fuel_type) ?? "yanacaq seçilməyib"}</span>
                          </p>
                        </div>
                      </div>
                      <div className="max-[391px]:absolute max-[391px]:right-3.5 max-[391px]:top-4 max-[391px]:text-right">
                        <p className="muted mb-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide max-[391px]:text-[9px]">100 km-ə sərf</p>
                        <NumberSave key={String(car.fuel_per_100)} value={car.fuel_per_100} suffix="L" placeholder="8" compact onSave={(v) => savePer100(car.id, v)} />
                      </div>
                      {/* Bu günün hesabatı */}
                      <div className="min-w-[170px]">
                        <p className="muted mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
                          <span className={`h-1.5 w-1.5 rounded-full ${s.tone === "done" ? "bg-ok" : s.tone === "open" ? "bg-amber-500" : "bg-line"}`} /> Bu gün
                        </p>
                        <p className="flex items-baseline gap-3">
                          <span className="text-lg font-extrabold tabular-nums">{t?.km ?? 0} km</span>
                          <span className="text-lg font-extrabold tabular-nums text-primary">{t?.cost != null ? azn(Number(t.cost)) : "—"}</span>
                          <span className="muted ml-auto min-w-0 truncate text-[10.5px] font-normal sm:hidden">{s.text}</span>
                        </p>
                        <p className="muted truncate text-[11px] max-sm:hidden">{s.text}</p>
                      </div>
                      <div className="text-right max-lg:flex max-lg:min-w-[55%] max-lg:flex-1 max-sm:basis-full max-lg:items-baseline max-lg:justify-between max-lg:gap-3 max-lg:border-t max-lg:border-line max-lg:pt-2.5">
                        <p className="muted text-[11px] font-semibold uppercase tracking-wide max-sm:whitespace-nowrap max-sm:text-[10px]">{PERIOD_LABEL[period]}: {range.label}</p>
                        <p className="font-extrabold tabular-nums">{azn(total.cost)}</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPicked(car.id); setOpen(expanded ? null : car.id); }} aria-expanded={expanded}
                        className="btn btn-soft btn-sm max-sm:w-full max-sm:justify-center">
                        {total.days} gün <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    {expanded && payments.length > 0 && (
                      <button type="button" onClick={() => setPaysOpen(paysOpen === car.id ? null : car.id)} aria-expanded={paysOpen === car.id}
                        className="flex w-full items-center gap-2.5 border-t border-line px-5 py-2.5 text-left text-sm transition-colors hover:bg-bg">
                        <HandCoins size={16} className="shrink-0 text-primary" />
                        <span className="font-semibold">Verilən pullar</span>
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{payments.length}</span>
                        <span className="ml-auto font-bold tabular-nums">{azn(paid)}</span>
                        <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${paysOpen === car.id ? "rotate-180" : ""}`} />
                      </button>
                    )}
                    {expanded && payments.length > 0 && paysOpen === car.id && (
                      <ul className="divide-y divide-line border-t border-line bg-bg/40">
                        {payments.map((p) => (
                          <li key={p.id} className="flex items-center gap-3 px-5 py-2 text-sm max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-2 max-sm:gap-y-1 max-sm:px-3.5">
                            <HandCoins size={15} className="shrink-0 text-primary max-sm:hidden" />
                            <span className="w-[4.5rem] shrink-0 text-xs font-semibold tabular-nums max-sm:w-auto">{numDate(p.day)}</span>
                            <b className="tabular-nums max-sm:text-right">{azn(Number(p.amount))}</b>
                            <span className="muted min-w-0 flex-1 truncate text-xs">{p.note}</span>
                            <span className="flex shrink-0 items-center gap-3 max-sm:justify-end max-sm:gap-2">
                            <PayStatus p={p} />
                            <ConfirmButton onConfirm={() => deletePayment(p.id)} success={false} className="icon-btn icon-btn-danger !h-7 !w-7" title="Ödənişi sil"
                              question={`${dayName(p.day)}: ${azn(Number(p.amount))} ödəniş silinəcək, balans dəyişəcək.`}>
                              <Trash2 size={13} />
                            </ConfirmButton>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {expanded && (
                      logs.length === 0 ? (
                        <p className="muted border-t border-line px-5 py-4 text-sm">Bu dövrdə yürüş yazılmayıb.</p>
                      ) : (
                        <div className="overflow-x-auto border-t border-line">
                          <table className="w-full text-sm max-sm:block md:min-w-[720px]">
                            <thead className="bg-bg text-left text-xs text-muted max-sm:hidden">
                              <tr>
                                <th className="px-5 max-md:px-3 py-2 font-semibold">Gün</th>
                                <th className="px-3 max-md:px-2 py-2 font-semibold"><span className="flex items-center gap-1.5"><span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><SunMedium size={15} strokeWidth={2.2} /></span> Səhər</span></th>
                                <th className="px-3 max-md:px-2 py-2 font-semibold"><span className="flex items-center gap-1.5"><span className="grid h-6 w-6 place-items-center rounded-lg bg-violet-100 text-violet-600"><MoonStar size={15} strokeWidth={2.2} /></span> Axşam</span></th>
                                <th className="max-md:hidden px-3 max-md:px-2 py-2 text-right font-semibold">Km</th>
                                <th className="px-3 max-md:px-2 py-2 text-right font-semibold">Məbləğ</th>
                                <th className="px-5 max-md:px-3 py-2 text-right font-semibold">Verildi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line max-sm:block">
                              {logs.map((l: Row) => (
                                <tr key={l.id} className={`max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-2.5 max-sm:px-3.5 max-sm:py-3 ${l.day === today ? "bg-primary-soft/40" : ""}`}>
                                  <td className="px-5 max-md:px-3 py-2 font-semibold max-sm:col-span-2 max-sm:flex max-sm:flex-wrap max-sm:items-baseline max-sm:gap-x-2 max-sm:!p-0"><span className="block whitespace-nowrap text-xs tabular-nums">{numDate(l.day)}</span>{l.day === today && <span className="block text-[11px] leading-tight text-primary">bu gün</span>}<span className="block whitespace-nowrap text-[11px] font-bold leading-tight text-ink md:hidden">{l.km ?? "—"} km</span></td>
                                  <td className="px-3 max-md:px-2 py-2 max-sm:block max-sm:!p-0">
                                    <span className="muted mb-1 block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Səhər</span>
                                    <span className="flex flex-col items-stretch gap-1">
                                      <span className="flex items-baseline justify-between gap-3 whitespace-nowrap"><span className="flex items-baseline gap-1"><b className="tabular-nums">{l.start_km.toLocaleString("az")}</b><span className="muted text-[11px] font-semibold">km</span></span><span className="muted text-[11px]">{timeBaku(l.start_at)}</span></span>
                                      <span className="self-start"><PhotoLink path={l.start_photo} label="Səhər" /></span></span>
                                  </td>
                                  <td className="px-3 max-md:px-2 py-2 max-sm:block max-sm:!p-0">
                                    <span className="muted mb-1 block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Axşam</span>
                                    {l.end_km != null ? (
                                      <span className="flex flex-col items-stretch gap-1">
                                        <span className="flex items-baseline justify-between gap-3 whitespace-nowrap"><span className="flex items-baseline gap-1"><b className="tabular-nums">{l.end_km.toLocaleString("az")}</b><span className="muted text-[11px] font-semibold">km</span></span>{l.end_at && <span className="muted text-[11px]">{timeBaku(l.end_at)}</span>}</span>
                                        <span className="self-start"><PhotoLink path={l.end_photo} label="Axşam" /></span></span>
                                    ) : <span className="muted text-xs">Yazılmayıb</span>}
                                  </td>
                                  <td className="max-md:hidden px-3 max-md:px-2 py-2 text-right font-bold tabular-nums">{l.km ?? "—"}</td>
                                  <td className="whitespace-nowrap px-3 max-md:px-2 py-2 text-right font-bold tabular-nums max-sm:block max-sm:!p-0 max-sm:text-left"><span className="muted block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Məbləğ</span>{l.cost != null ? azn(Number(l.cost)) : "—"}</td>
                                  <td className="px-5 max-md:px-3 py-2 text-right max-sm:block max-sm:!p-0">
                                    <span className="muted block text-[10px] font-semibold uppercase tracking-wide sm:hidden">Verildi</span>
                                    {(() => {
                                      const dayPays = payments.filter((p) => p.day === l.day);
                                      if (dayPays.length === 0) return <span className="whitespace-nowrap rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-bold text-danger">Verilmədi</span>;
                                      return (
                                        <span className="inline-flex flex-col items-end gap-0.5">
                                          {dayPays.map((p) => <span key={p.id} className="flex items-center gap-1.5"><b className="tabular-nums">{azn(Number(p.amount))}</b><PayStatus p={p} /></span>)}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-bg font-bold max-sm:block">
                              <tr className="max-sm:grid max-sm:grid-cols-2 max-sm:gap-y-1 max-sm:px-3.5 max-sm:py-2.5">
                                <td className="px-5 max-md:px-3 py-2 max-sm:col-span-2 max-sm:!p-0" colSpan={3}>Cəmi · {range.label} ({total.days} / {range.workdays} iş günü)</td>
                                <td className="max-md:hidden px-3 max-md:px-2 py-2 text-right tabular-nums">{total.km}</td>
                                <td className="whitespace-nowrap px-3 max-md:px-2 py-2 text-right tabular-nums max-sm:block max-sm:!p-0 max-sm:text-left">{azn(total.cost)}</td>
                                <td className="px-5 max-md:px-3 py-2 text-right tabular-nums max-sm:block max-sm:!p-0">{azn(paid)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Page>
  );
}
