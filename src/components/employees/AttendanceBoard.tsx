"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CalendarX, ChevronLeft, ChevronRight, FileSpreadsheet, Search, Undo2, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { exportAttendanceAll, exportAttendanceEmployee } from "@/lib/export-attendance";
import { MONTHS_AZ, presenceText, shiftMonth, todayBaku, useMonthAttendance, type MonthAttendance } from "@/lib/attendance";
import { initials } from "@/lib/experience";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { AttendanceCalendar } from "./AttendanceCalendar";

type Emp = { id: number; full_name: string; photo_url: string | null; specialty: string | null };

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Bu günün vəziyyət həbi (yalnız cari ayda)
function todayBadge(a: MonthAttendance) {
  const p = a.today.presence;
  switch (a.today.status) {
    case "present": return p?.out
      ? { text: `İşi bitirib · ${presenceText(p)}`, cls: "bg-bg text-ink" }
      : { text: `İşdədir · ${p ? presenceText(p) : ""}`, cls: "bg-ok-soft text-ok" };
    case "leave": return { text: "İcazəlidir", cls: "bg-violet-50 text-violet-700" };
    case "off": return { text: "Bazar: istirahət", cls: "bg-slate-200 text-slate-600" };
    case "absent": return { text: "İşdə olmayıb", cls: "bg-danger text-white" };
    default: return { text: "Hələ gəlməyib", cls: "bg-bg text-muted" };
  }
}

// Davamiyyət bölməsi (usta panelində /davamiyyet, admin-də /davamiyyet): ay seçimi + bütün ustaların cədvəli
// (iş günü, işdə [+bazar], icazəli, gəlmədi, bu gün). Sətrə klik → ustanın təqvimi və gəlmə/getmə saatları. Realtime ilə.
// Web və admin-də eyni fayl. meId verilsə öz sətrin birinci və "Sən" nişanlı.
// canMark (admin): bu gün gəlməyən ustanı "İşdə olmayıb" qeyd etmək və geri almaq (attendance_absences, 0065)
export function AttendanceBoard({ meId = null, canMark = false }: { meId?: number | null; canMark?: boolean }) {
  const thisMonth = todayBaku().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [emps, setEmps] = useState<Emp[] | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Emp | null>(null);
  const att = useMonthAttendance(month);
  const [busy, setBusy] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false); // Excel pəncərəsi

  async function mark(e: Emp, absent: boolean) {
    setBusy(e.id);
    const supabase = createClient();
    const day = todayBaku();
    const { error } = absent
      ? await supabase.from("attendance_absences").insert({ employee_id: e.id, day })
      : await supabase.from("attendance_absences").delete().eq("employee_id", e.id).eq("day", day);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(absent ? `${e.full_name}: bu gün işdə olmayıb` : `${e.full_name}: qeyd geri alındı`);
  }

  useEffect(() => {
    let cancelled = false;
    createClient().from("employees").select("id, full_name, photo_url, specialty").eq("is_management", false).eq("is_active", true).order("full_name")
      .then((r) => { if (!cancelled) setEmps(r.data ?? []); });
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return (emps ?? [])
      .filter((e) => words.every((w) => norm(`${e.full_name} ${e.specialty}`).includes(w)))
      .sort((a, b) => Number(b.id === meId) - Number(a.id === meId));
  }, [emps, query, meId]);

  // Bu günün vəziyyəti (yalnız cari ay): neçə usta işdədir, işi bitirib, icazəlidir, hələ gəlməyib; gözləyən icazə sorğuları
  const today = useMemo(() => {
    const t = { here: 0, done: 0, leave: 0, missing: 0, absent: 0, pending: 0 };
    for (const e of emps ?? []) {
      const a = att?.byEmployee.get(e.id) ?? att?.empty;
      if (!a) continue;
      t.pending += a.pendingLeave;
      if (a.today.status === "present" && a.today.presence?.out) t.done += 1;
      else if (a.today.status === "present") t.here += 1;
      else if (a.today.status === "leave") t.leave += 1;
      else if (a.today.status === "pending") t.missing += 1;
      else if (a.today.status === "absent") t.absent += 1;
    }
    return t;
  }, [att, emps]);

  const [y, m] = month.split("-").map(Number);
  const isCurrent = month === thisMonth;

  return (
    <div className="space-y-4">
      {open && <AttendanceCalendar employeeId={open.id} name={open.full_name} onClose={() => setOpen(null)} />}
      {exporting && emps && <ExportModal month={month} emps={emps} onClose={() => setExporting(false)} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} className="icon-btn" aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
          <h2 className="min-w-40 text-center text-lg font-bold">{MONTHS_AZ[m - 1]} {y}</h2>
          <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} disabled={isCurrent} className="icon-btn disabled:opacity-30" aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
          {!isCurrent && <button type="button" onClick={() => setMonth(thisMonth)} className="btn btn-soft btn-sm ml-1">Bu ay</button>}
        </div>
        <div className="search min-w-56 flex-1">
          <Search size={20} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Usta adı ilə axtar..." aria-label="Usta axtarışı" />
        </div>
        <button type="button" onClick={() => setExporting(true)} disabled={!emps?.length} className="btn btn-soft !h-12 shrink-0" title="Davamiyyəti Excel fayla çıxar">
          <FileSpreadsheet size={18} className="text-ok" /> Excel
        </button>
      </div>

      {isCurrent && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Hazırda işdə", value: today.here, cls: "text-ok" },
            { label: "İşi bitirib", value: today.done, cls: "text-ink" },
            { label: "Bu gün icazəli", value: today.leave, cls: "text-violet-600" },
            { label: "Bu gün hələ gəlməyib", value: today.missing, cls: "text-ink" },
            { label: "Bu gün işdə olmayıb", value: today.absent, cls: today.absent ? "text-danger" : "text-ink" },
            { label: "Gözləyən icazə sorğusu", value: today.pending, cls: "text-primary" },
          ].map((x) => (
            <div key={x.label} className="card !py-3">
              <p className="muted text-xs font-semibold">{x.label}</p>
              <p className={`text-2xl font-extrabold ${x.cls}`}>{att ? x.value : "…"}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-line bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <th className="px-4 py-2.5">Usta</th>
              <th className="px-2 py-2.5 text-center" title="Ayın bu günə qədər iş günləri (B.e.–Şənbə)">İş günü</th>
              <th className="px-2 py-2.5 text-center">İşdə olub</th>
              <th className="px-2 py-2.5 text-center">İcazə aldı</th>
              <th className="px-2 py-2.5 text-center" title="İş günü gəlməyib, icazəsi də yoxdur">İcazəsiz qalıb</th>
              <th className="px-2 py-2.5 text-center" title="Ay ərzində işdə olmadığı bütün iş günləri: icazəli + icazəsiz">İşdə olmayıb (cəmi)</th>
              <th className="px-2 py-2.5 text-center">Bazar günü işə çıxıb</th>
              <th className="px-4 py-2.5 text-right">{isCurrent ? "Bu gün" : ""}</th>
            </tr>
          </thead>
          <tbody>
            {emps === null ? (
              <tr><td colSpan={8} className="muted py-10 text-center">Yüklənir...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="muted py-10 text-center">Usta tapılmadı.</td></tr>
            ) : rows.map((e) => {
              const a = att ? att.byEmployee.get(e.id) ?? att.empty : null;
              const t = a && isCurrent ? todayBadge(a) : null;
              return (
                <tr key={e.id} onClick={() => setOpen(e)} className={`cursor-pointer border-b border-line last:border-b-0 transition-colors hover:bg-primary-soft/40 ${e.id === meId ? "bg-primary-soft/30" : ""}`}>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-3">
                      {e.photo_url
                        // eslint-disable-next-line @next/next/no-img-element -- storage avatarı
                        ? <img src={e.photo_url} alt={e.full_name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                        : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">{initials(e.full_name)}</span>}
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-semibold">
                          <span className="truncate">{e.full_name}</span>
                          {e.id === meId && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
                        </span>
                        <span className="muted block truncate text-xs">{e.specialty ?? ""}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center font-semibold tabular-nums">{a?.workdays ?? "…"}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums"><b className="text-ok">{a?.present ?? "…"}</b> <span className="muted text-xs">gün</span></td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {a?.leaveTimes ? <><b className="text-violet-600">{a.leaveTimes}</b> <span className="muted text-xs">dəfə · {a.leave} gün</span></> : <span className="muted">—</span>}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{a?.absent ? <><b className="text-danger">{a.absent}</b> <span className="muted text-xs">gün</span></> : <span className="muted">—</span>}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{a && a.leave + a.absent ? <><b className="text-ink">{a.leave + a.absent}</b> <span className="muted text-xs">gün</span></> : <span className="muted">—</span>}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{a?.extra ? <><b className="text-slate-600">{a.extra}</b> <span className="muted text-xs">dəfə</span></> : <span className="muted">—</span>}</td>
                  <td className="px-4 py-2.5 text-right">
                    {t && canMark && (a?.today.status === "pending" || a?.today.status === "absent") ? (
                      <span className="inline-flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
                        <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${t.cls}`}>{t.text}</span>
                        {a.today.status === "pending" ? (
                          <button type="button" disabled={busy === e.id} onClick={() => mark(e, true)} className="btn btn-soft btn-sm !h-7 !px-2 text-xs text-danger" title="Bu gün işə gəlməyib: gəlmədi sayılsın">
                            <CalendarX size={13} /> İşdə olmayıb
                          </button>
                        ) : (
                          <button type="button" disabled={busy === e.id} onClick={() => mark(e, false)} className="btn btn-soft btn-sm !h-7 !px-2 text-xs" title="Qeydi geri al">
                            <Undo2 size={13} /> Geri al
                          </button>
                        )}
                      </span>
                    ) : t ? <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${t.cls}`}>{t.text}</span>
                      : <span className="muted inline-flex items-center gap-1 text-xs"><CalendarCheck size={13} /> Təqvim</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Excel ixracı: bütün ustalar (Xülasə + Gün-gün) və ya seçilmiş bir usta (gün-gün saatlarla); seçilmiş ay üzrə
function ExportModal({ month, emps, onClose }: { month: string; emps: Emp[]; onClose: () => void }) {
  const [who, setWho] = useState("all");
  const [pending, setPending] = useState(false);
  const [y, m] = month.split("-").map(Number);

  async function run() {
    setPending(true);
    try {
      const emp = emps.find((e) => String(e.id) === who);
      if (emp) await exportAttendanceEmployee(month, emp);
      else await exportAttendanceAll(month, emps);
      onClose();
    } catch {
      toast.error("Excel fayl yaradılmadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="att-export-title" className="!max-w-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="att-export-title" className="flex items-center gap-2 text-lg font-bold"><FileSpreadsheet size={18} className="text-ok" /> Davamiyyəti Excel-ə çıxar</h2>
          <p className="muted text-sm">{MONTHS_AZ[m - 1]} {y}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <label className="block">
        <span className="label">Kimin davamiyyəti</span>
        <select value={who} onChange={(e) => setWho(e.target.value)} className="field cursor-pointer">
          <option value="all">Bütün ustalar (tam siyahı)</option>
          {emps.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
      </label>
      <p className="muted mt-2 text-xs">
        {who === "all"
          ? "İki vərəq: Xülasə (hər usta bir sətir) və Gün-gün (✓ işdə, İ icazəli, X gəlmədi, B bazar)."
          : "Ayın hər günü: vəziyyət, gəlmə və getmə saatı, müddət; yuxarıda aylıq xülasə."}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
        <button type="button" onClick={run} disabled={pending} className="btn btn-primary"><FileSpreadsheet size={16} /> {pending ? "Hazırlanır..." : "Yüklə"}</button>
      </div>
    </Modal>
  );
}
