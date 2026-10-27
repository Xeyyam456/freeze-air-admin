import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, FileSpreadsheet, LogIn, LogOut, X } from "lucide-react";
import { exportAttendanceEmployee } from "@/lib/export-attendance";
import { Modal } from "@/components/Modal";
import { fetchEmployeeMonth, MONTHS_AZ, presenceText, sessionNo, shiftMonth, timeBaku, todayBaku, useAttendanceLive, type DayStatus } from "@/lib/attendance";
import { useData } from "@/lib/useData";

const WEEK = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];
const WEEKDAY = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];

// "21.10.2026"
const fullDate = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;
const weekday = (d: string) => WEEKDAY[new Date(`${d}T12:00:00Z`).getUTCDay()];

// Gün xanasının görünüşü: işdə yaşıl ✓, icazəli bənövşəyi, gəlmədi qırmızı, bazar tünd boz, gələcək solğun
const CELL: Record<DayStatus, string> = {
  present: "bg-ok text-white",
  leave: "bg-violet-500 text-white",
  absent: "bg-danger text-white",
  pending: "bg-primary-soft text-primary ring-2 ring-primary",
  off: "bg-slate-300 text-slate-600",
  future: "bg-bg text-muted",
  before: "bg-bg text-muted/60",
};
const LEGEND: { s: DayStatus; label: string }[] = [
  { s: "present", label: "İşdə" },
  { s: "leave", label: "İcazəli" },
  { s: "absent", label: "Gəlmədi" },
  { s: "off", label: "Bazar (istirahət)" },
];

type Data = Awaited<ReturnType<typeof fetchEmployeeMonth>>;

// Ustanın ay üzrə davamiyyət təqvimi: hər iş günü rəngli xana (işdə ✓ + gəlmə/getmə saatı), ay oxları, xülasə.
// Realtime ilə yenilənir (attendance, leave_requests). Web-də eyni fayl.
export function AttendanceCalendar({ employeeId, name, onClose }: { employeeId: number; name: string; onClose: () => void }) {
  const [month, setMonth] = useState(() => todayBaku().slice(0, 7));
  // Keşdə + canlı (lib/attendance.ts): təqvimi təkrar açanda dərhal görünür
  useAttendanceLive();
  const data: { month: string; d: Data } | null = useData("employee-month", async () => ({ month, d: await fetchEmployeeMonth(employeeId, month) }), [employeeId, month]);

  const current = data?.month === month ? data.d : null;
  const [y, m] = month.split("-").map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // bazar ertəsindən başlayan həftə
  const thisMonth = todayBaku().slice(0, 7);
  const s = current?.summary;

  return (
    <Modal onClose={onClose} labelledBy="att-cal-title" className="!max-w-3xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="att-cal-title" className="text-lg font-bold">Davamiyyət təqvimi</h2>
          <p className="muted truncate text-sm">{name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => void exportAttendanceEmployee(month, { id: employeeId, full_name: name })} className="btn btn-soft btn-sm" title="Bu ayı Excel fayla çıxar">
            <FileSpreadsheet size={15} className="text-ok" /> Excel
          </button>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
      </div>

      {/* Solda təqvim və xülasə, sağda gün-gün gəlmə/getmə saatları (dar ekranda alt-alta) */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
      <div className="mb-2 flex items-center gap-2">
        <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} className="icon-btn" aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
        <p className="flex-1 text-center font-bold">{MONTHS_AZ[m - 1]} {y}</p>
        <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= thisMonth} className="icon-btn disabled:opacity-30" aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((w) => <span key={w} className="muted pb-1 text-[11px] font-semibold">{w}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
        {current
          ? current.days.map(({ day, status, presence }) => (
            <span key={day} title={presence ? `İşdə: ${presenceText(presence)}` : undefined}
              className={`flex h-9 flex-col items-center justify-center rounded-lg text-sm font-bold ${CELL[status]}`}>
              {status === "present" ? <Check size={14} strokeWidth={3} /> : Number(day.slice(8))}
              {status === "present" && <span className="text-[10px] font-semibold leading-none opacity-90">{Number(day.slice(8))}</span>}
            </span>
          ))
          : Array.from({ length: 30 }, (_, i) => <span key={i} className="h-9 rounded-lg bg-bg" />)}
      </div>

      <div className="mt-2.5 flex flex-nowrap items-center gap-x-4 gap-y-1 whitespace-nowrap max-sm:justify-between max-sm:gap-x-2 sm:flex-wrap">
        {LEGEND.map((l) => (
          <span key={l.s} className="muted flex items-center gap-1.5 text-xs max-sm:gap-1 max-sm:text-[11px]"><span className={`h-3 w-3 shrink-0 rounded max-sm:h-2.5 max-sm:w-2.5 ${CELL[l.s]}`} />{l.label.replace(" (istirahət)", "")}<span className="max-sm:hidden">{l.label.includes("(istirahət)") ? " (istirahət)" : ""}</span></span>
        ))}
      </div>

      {s && (
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
          {[
            { label: "İş günü", value: s.workdays, cls: "text-ink" },
            { label: "İşdə", value: s.present, cls: "text-ok", sub: s.extra ? `+${s.extra} bazar` : undefined },
            { label: "İcazəli", value: s.leave, cls: "text-violet-600" },
            { label: "Gəlmədi", value: s.absent, cls: s.absent ? "text-danger" : "text-ink" },
          ].map((x) => (
            <div key={x.label} className="rounded-lg bg-bg py-1.5">
              <p className={`text-base font-bold ${x.cls}`}>{x.value}{"sub" in x && x.sub && <span className="ml-1 text-[11px] font-semibold text-slate-500">{x.sub}</span>}</p>
              <p className="muted text-[11px] font-medium">{x.label}</p>
            </div>
          ))}
        </div>
      )}

      </div>

      {/* İşdə olduğu günlərin saatları: tam tarix, həftənin günü, gəlmə – getmə və müddət (yenisi yuxarıda) */}
      <div className="flex min-h-0 flex-col">
        <span className="label flex items-center gap-1.5"><Clock size={14} className="text-primary" /> Gəlmə və getmə saatları</span>
        {!current ? (
          <div className="flex-1 rounded-xl bg-bg" />
        ) : !current.days.some((d) => d.presence && d.status === "present") ? (
          <p className="muted grid flex-1 place-items-center rounded-xl border border-dashed border-line p-6 text-center text-sm">Bu ayda gəlmə qeydi yoxdur.</p>
        ) : (
          <ul className="max-h-[340px] flex-1 divide-y divide-line overflow-y-auto rounded-xl border border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {current.days.filter((d) => d.presence && d.status === "present").reverse().map(({ day, presence }) => {
              const p = presence!;
              return (
                <li key={day} className="flex items-center gap-3 px-3 py-2 max-sm:px-2.5 max-sm:py-1.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold tabular-nums max-sm:text-xs">{fullDate(day)}</span>
                    <span className="muted block text-[11px]">{weekday(day)}</span>
                  </span>
                  {/* Hər seans ayrıca sətir: işi bitirib yenidən işə çıxıbsa bir neçə gəlmə – getmə */}
                  <span className="flex shrink-0 flex-col items-end gap-1 max-sm:gap-0.5" title={presenceText(p)}>
                    {p.sessions.map((x, i) => (
                      <span key={x.in} className="flex items-center gap-1.5">
                        {p.sessions.length > 1 && <span className="muted w-5 text-right text-xs font-bold tabular-nums">{sessionNo(i, p.sessions.length).trim()}</span>}
                        <span className="flex items-center gap-1 rounded-lg bg-ok-soft px-2 py-1 text-xs font-bold tabular-nums text-ok max-sm:px-1 max-sm:py-0.5 max-sm:text-[11px] max-[360px]:text-[10.5px]" title="Gəlmə saatı">
                          <LogIn size={12} /> {timeBaku(x.in)}
                        </span>
                        {x.out ? (
                          <span className="flex items-center gap-1 rounded-lg bg-bg px-2 py-1 text-xs font-bold tabular-nums max-sm:px-1 max-sm:py-0.5 max-sm:text-[11px] max-[360px]:text-[10.5px]" title="Getmə saatı">
                            <LogOut size={12} /> {timeBaku(x.out)}
                          </span>
                        ) : (
                          <span className="rounded-lg bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">hələ işdədir</span>
                        )}
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </div>
    </Modal>
  );
}
