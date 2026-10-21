import { fetchEmployeeMonth, monthDays, MONTHS_AZ, timeBaku, type DayStatus, type Presence } from "@/lib/attendance";
import { toast } from "@/lib/toast";

// Davamiyyətin Excel ixracı (write-excel-file 4.1.1, "Görülən işlər" ixracı ilə eyni üslub: tünd başlıq, mavi cədvəl başlığı,
// zebra, nazik haşiyələr). İki variant: bütün ustalar (Xülasə + Gün-gün vərəqləri) və bir usta (gün-gün saatlarla).
// Web və admin-də eyni fayl.

type Emp = { id: number; full_name: string; specialty: string | null };

const NAVY = "#0a1a33", BLUE = "#1f6feb", LINE = "#d9dfeb", ZEBRA = "#f4f7fc", MUTED = "#667085", SOFT = "#eaf2fe";
const OK = "#16a34a", VIOLET = "#7c3aed", RED = "#dc2626", SLATE = "#64748b";
const WEEKDAY = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const WEEK_SHORT = ["B", "B.e", "Ç.a", "Ç", "C.a", "C", "Ş"];

const border = { borderColor: LINE, borderStyle: "thin" as const };
const head = (value: string, align: "left" | "center" = "center") =>
  ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: BLUE, align, alignVertical: "center" as const, height: 30, wrap: true, ...border });
const span = (cols: number, value: string, style: Record<string, unknown>) => [{ value, columnSpan: cols, ...style }, ...Array(cols - 1).fill(null)];
const title = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", fontSize: 16, textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 34, indent: 1 });
const sub = (cols: number, value: string) => span(cols, value, { fontSize: 10, textColor: MUTED, alignVertical: "center", height: 20, indent: 1 });
const note = (cols: number, value: string) => span(cols, value, { fontWeight: "bold", textColor: BLUE, backgroundColor: SOFT, alignVertical: "center", height: 26, indent: 1 });

const weekday = (d: string) => new Date(`${d}T12:00:00Z`).getUTCDay();
const ddmm = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;
function period(month: string) {
  const days = monthDays(month);
  return `Dövr: ${ddmm(days[0])} – ${ddmm(days[days.length - 1])} · iş həftəsi 6 gün (bazar istirahət)`;
}
function duration(p: Presence) {
  if (!p.out) return "";
  const min = Math.max(0, Math.round((new Date(p.out).getTime() - new Date(p.in).getTime()) / 60000));
  return `${Math.floor(min / 60)} saat ${min % 60} dəq`;
}

// Gün-gün cədvəlində xana: işarə və rəng
const MARK: Record<DayStatus, { v: string; bg?: string; color?: string }> = {
  present: { v: "✓", bg: "#dcfce7", color: OK },
  leave: { v: "İ", bg: "#ede9fe", color: VIOLET },
  absent: { v: "X", bg: "#fee2e2", color: RED },
  off: { v: "B", bg: "#e2e8f0", color: SLATE },
  pending: { v: "", bg: "#ffffff" },
  future: { v: "" },
  before: { v: "" },
};
const STATUS_TEXT: Record<DayStatus, { v: string; color: string }> = {
  present: { v: "İşdə", color: OK },
  leave: { v: "İcazəli", color: VIOLET },
  absent: { v: "Gəlmədi", color: RED },
  off: { v: "Bazar (istirahət)", color: SLATE },
  pending: { v: "Hələ gəlməyib", color: MUTED },
  future: { v: "", color: MUTED },
  before: { v: "Qeyd yoxdur", color: MUTED },
};

async function writer() {
  return (await import("write-excel-file/browser")).default;
}

// Bütün ustalar: 1) Xülasə (hər usta bir sətir), 2) Gün-gün (ustalar × ayın günləri)
export async function exportAttendanceAll(month: string, emps: Emp[]) {
  if (emps.length === 0) return toast.error("Usta yoxdur.");
  const [y, m] = month.split("-").map(Number);
  const data = await Promise.all(emps.map((e) => fetchEmployeeMonth(e.id, month)));
  const days = monthDays(month);
  const label = `${MONTHS_AZ[m - 1]} ${y}`;

  // 1) Xülasə
  const C1 = 10;
  const summary = [
    title(C1, `Freeze Air Service — Davamiyyət: ${label}`),
    sub(C1, period(month)),
    note(C1, `Usta sayı: ${emps.length}     İşdə olub: ${data.reduce((s, d) => s + d.summary.present, 0)} gün     İcazəsiz qalıb: ${data.reduce((s, d) => s + d.summary.absent, 0)} gün`),
    Array(C1).fill(null),
    [head("№"), head("Usta", "left"), head("İxtisas", "left"), head("İş günü"), head("İşdə olub (gün)"), head("İcazə aldı (dəfə)"),
      head("İcazəli (gün)"), head("İcazəsiz qalıb (gün)"), head("İşdə olmayıb, cəmi (gün)"), head("Bazar günü işə çıxıb (dəfə)")],
    ...emps.map((e, i) => {
      const s = data[i].summary;
      const base = { alignVertical: "center" as const, height: 22, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const num = (v: number, color = "#111827") => ({ ...base, value: v, type: Number, align: "center" as const, fontWeight: "bold" as const, textColor: v ? color : MUTED });
      return [
        { ...base, value: i + 1, type: Number, align: "center" as const, textColor: MUTED },
        { ...base, value: e.full_name, fontWeight: "bold" as const },
        { ...base, value: e.specialty ?? "", textColor: MUTED },
        num(s.workdays), num(s.present, OK), num(s.leaveTimes, VIOLET), num(s.leave, VIOLET), num(s.absent, RED),
        num(s.leave + s.absent), num(s.extra, SLATE),
      ];
    }),
  ];

  // 2) Gün-gün
  const C2 = days.length + 1;
  const grid = [
    title(C2, `Gün-gün davamiyyət: ${label}`),
    sub(C2, "✓ işdə · İ icazəli · X gəlmədi · B bazar (istirahət)"),
    Array(C2).fill(null),
    [head("Usta", "left"), ...days.map((d) => head(`${Number(d.slice(8))}\n${WEEK_SHORT[weekday(d)]}`))],
    ...emps.map((e, i) => [
      { value: e.full_name, fontWeight: "bold" as const, alignVertical: "center" as const, height: 22, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...border },
      ...data[i].days.map(({ status }) => {
        const k = MARK[status];
        return {
          value: k.v, align: "center" as const, alignVertical: "center" as const, fontWeight: "bold" as const,
          textColor: k.color, ...(k.bg ? { backgroundColor: k.bg } : {}), ...border,
        };
      }),
    ]),
  ];

  const write = await writer();
  await write([
    { data: summary, sheet: "Xülasə", columns: [{ width: 5 }, { width: 26 }, { width: 22 }, ...Array(7).fill({ width: 13 })], stickyRowsCount: 5, showGridLines: false, orientation: "landscape" },
    { data: grid, sheet: "Gün-gün", columns: [{ width: 24 }, ...days.map(() => ({ width: 5 }))], stickyRowsCount: 4, stickyColumnsCount: 1, showGridLines: false, orientation: "landscape" },
  ], { fontFamily: "Calibri", fontSize: 11 }).toFile(`davamiyyet-${month}.xlsx`);
  toast.success(`${emps.length} ustanın davamiyyəti Excel fayla yazıldı`);
}

// Bir usta: ayın hər günü (tarix, həftənin günü, vəziyyət, gəlmə, getmə, müddət) + yuxarıda xülasə
export async function exportAttendanceEmployee(month: string, emp: Pick<Emp, "id" | "full_name">) {
  const [y, m] = month.split("-").map(Number);
  const { summary: s, days } = await fetchEmployeeMonth(emp.id, month);
  const rows = days.filter((d) => d.status !== "future");
  if (rows.length === 0) return toast.error("Bu ay üçün hələ məlumat yoxdur.");
  const C = 6;
  const data = [
    title(C, `Freeze Air Service — ${emp.full_name}: davamiyyət, ${MONTHS_AZ[m - 1]} ${y}`),
    sub(C, period(month)),
    note(C, `İş günü: ${s.workdays}   İşdə: ${s.present}   İcazə: ${s.leaveTimes} dəfə (${s.leave} gün)   İcazəsiz: ${s.absent}   İşdə olmayıb, cəmi: ${s.leave + s.absent}   Bazar günü: ${s.extra}`),
    Array(C).fill(null),
    [head("Tarix"), head("Həftənin günü", "left"), head("Vəziyyət", "left"), head("Gəlmə"), head("Getmə"), head("Müddət")],
    ...rows.map(({ day, status, presence }, i) => {
      const st = STATUS_TEXT[status];
      const sunday = status === "off" || weekday(day) === 0;
      const base = { alignVertical: "center" as const, height: 22, ...(sunday ? { backgroundColor: "#f1f5f9" } : i % 2 ? { backgroundColor: ZEBRA } : {}), ...border };
      const [yy, mm, dd] = day.split("-").map(Number);
      return [
        { ...base, value: new Date(Date.UTC(yy, mm - 1, dd)), type: Date, format: "dd.mm.yyyy", align: "center" as const },
        { ...base, value: WEEKDAY[weekday(day)], textColor: sunday ? SLATE : "#111827" },
        { ...base, value: st.v, textColor: st.color, fontWeight: "bold" as const },
        { ...base, value: presence ? timeBaku(presence.in) : "", align: "center" as const },
        { ...base, value: presence?.out ? timeBaku(presence.out) : presence ? "işdədir" : "", align: "center" as const, textColor: presence?.out ? "#111827" : MUTED },
        { ...base, value: presence ? duration(presence) : "", align: "center" as const, textColor: MUTED },
      ];
    }),
  ];
  const write = await writer();
  await write(data, {
    sheet: `${MONTHS_AZ[m - 1]} ${y}`,
    columns: [{ width: 13 }, { width: 18 }, { width: 18 }, { width: 10 }, { width: 10 }, { width: 16 }],
    stickyRowsCount: 5, showGridLines: false,
  }, { fontFamily: "Calibri", fontSize: 11 }).toFile(`davamiyyet-${emp.full_name.replace(/\s+/g, "-")}-${month}.xlsx`);
  toast.success(`${emp.full_name}: davamiyyət Excel fayla yazıldı`);
}
