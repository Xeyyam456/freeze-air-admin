import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Davamiyyət (migrasiya 0059, 0061): iş həftəsi 6 gündür, bazar günü iş günü deyil.
// Usta səhər "İşə gəldim" (check_in), axşam "İşi bitirdim" (check_out) basır; bazar günü çağırılıbsa da basa bilər (0062, əlavə gün); icazəni usta istəyir, admin təsdiqləyir.
// Təsdiqlənmiş icazə günü "icazəli" sayılır (həmin gün işə gəlib sonra icazə alıbsa da).
// Web `lib/attendance.ts` ilə eynidir (sinxron saxla).

export type DayStatus = "present" | "leave" | "absent" | "pending" | "off" | "future" | "before";
// pending = bu gün, hələ basmayıb; off = bazar; before = davamiyyət başlamazdan əvvəl
export type Presence = { in: string; out: string | null };
export type MonthAttendance = {
  workdays: number; // ayın bu günə qədər iş günləri (B.e.–Şənbə; ATTENDANCE_START-dan)
  present: number; // işdə olduğu günlər
  leave: number; // təsdiqlənmiş icazə günləri
  absent: number; // keçmiş iş günlərindən nə işdə, nə icazəli
  leaveTimes: number; // neçə dəfə icazə alıb (ayla kəsişən təsdiqlənmiş sorğular)
  extra: number; // bazar günü işə çıxdığı günlər (əlavə; iş günlərinə və "gəlmədi"yə təsir etmir)
  today: { status: DayStatus; presence: Presence | null };
  pendingLeave: number; // gözləyən icazə sorğuları
};
export type Leave = { id: number; employee_id: number; date_from: string; date_to: string; reason: string | null; status: string; created_at: string };
type AttRow = { employee_id: number; day: string; checked_in_at: string; checked_out_at: string | null };

const pad = (n: number) => String(n).padStart(2, "0");

// Davamiyyət bu gündən aparılır (sistem işə düşdü): əvvəlki günlər qeydsizdir, "gəlmədi" sayılmamalıdır
export const ATTENDANCE_START = "2026-10-21";

// Bakı vaxtı ilə bu gün "YYYY-MM-DD"
export function todayBaku() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date());
}

export function isWorkday(iso: string) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay() !== 0; // 0 = bazar
}

// Ayın günləri ("YYYY-MM" → ["YYYY-MM-01", ...])
export function monthDays(month: string) {
  const [y, m] = month.split("-").map(Number);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => `${month}-${pad(i + 1)}`);
}

// "YYYY-MM" ± ay
export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

// İcazənin iş günlərinin sayı (bazarlar sayılmır)
export function leaveWorkdays(l: Pick<Leave, "date_from" | "date_to">) {
  let n = 0;
  for (let d = new Date(`${l.date_from}T12:00:00Z`); d <= new Date(`${l.date_to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() !== 0) n += 1;
  }
  return n;
}

// Bir günün vəziyyəti (təsdiqlənmiş icazə işdə olmaqdan üstündür). marked: admin "işdə olmayıb" qeyd etdiyi günlər (0065)
export function dayStatus(d: string, today: string, presence: Map<string, Presence>, leaves: Leave[], marked: Set<string> = new Set()): DayStatus {
  if (!isWorkday(d)) return presence.has(d) ? "present" : "off"; // bazar: çağırılıb işə çıxıbsa işdədir
  if (d > today) return leaves.some((l) => l.status === "approved" && l.date_from <= d && d <= l.date_to) ? "leave" : "future";
  if (leaves.some((l) => l.status === "approved" && l.date_from <= d && d <= l.date_to)) return "leave";
  if (presence.has(d)) return "present";
  if (marked.has(d)) return "absent"; // admin qeyd edib: gün bitməmiş də gəlmədi sayılır
  if (d < ATTENDANCE_START) return "before"; // qeydi olmayan köhnə gün "gəlmədi" sayılmır
  return d < today ? "absent" : "pending";
}

export function summarize(month: string, today: string, presence: Map<string, Presence>, leaves: Leave[], marked: Set<string> = new Set()): MonthAttendance {
  const r: MonthAttendance = { workdays: 0, present: 0, leave: 0, absent: 0, leaveTimes: 0, extra: 0, today: { status: "future", presence: null }, pendingLeave: leaves.filter((l) => l.status === "pending").length };
  for (const d of monthDays(month)) {
    const st = dayStatus(d, today, presence, leaves, marked);
    if (d > today || st === "off" || st === "before") continue;
    if (!isWorkday(d)) {
      r.extra += 1; // bazar günü işləyib
      continue;
    }
    r.workdays += 1;
    if (st === "present") r.present += 1;
    else if (st === "leave") r.leave += 1;
    else if (st === "absent") r.absent += 1;
  }
  const [first, last] = [`${month}-01`, monthDays(month).at(-1)!];
  r.leaveTimes = leaves.filter((l) => l.status === "approved" && l.date_from <= last && l.date_to >= first).length;
  if (today.startsWith(month)) r.today = { status: dayStatus(today, today, presence, leaves, marked), presence: presence.get(today) ?? null };
  return r;
}

const toPresence = (rows: AttRow[]) => new Map(rows.map((a) => [a.day, { in: a.checked_in_at, out: a.checked_out_at }]));

async function fetchRange(from: string, to: string, employeeId?: number) {
  const supabase = createClient();
  let att = supabase.from("attendance").select("employee_id, day, checked_in_at, checked_out_at").gte("day", from).lte("day", to);
  let lv = supabase.from("leave_requests").select("id, employee_id, date_from, date_to, reason, status, created_at").lte("date_from", to).gte("date_to", from);
  let ab = supabase.from("attendance_absences").select("employee_id, day").gte("day", from).lte("day", to);
  if (employeeId) {
    att = att.eq("employee_id", employeeId);
    lv = lv.eq("employee_id", employeeId);
    ab = ab.eq("employee_id", employeeId);
  }
  const [a, l, x] = await Promise.all([att.then((r) => (r.data ?? []) as AttRow[]), lv.then((r) => (r.data ?? []) as Leave[]), ab.then((r) => r.data ?? [])]);
  return { att: a, leaves: l, absences: x };
}

// Bütün ustaların ay üzrə davamiyyəti: usta id → xülasə
export async function fetchMonthAttendance(month: string) {
  const days = monthDays(month);
  const { att, leaves, absences } = await fetchRange(days[0], days[days.length - 1]);
  const today = todayBaku();
  const ids = new Set([...att.map((a) => a.employee_id), ...leaves.map((l) => l.employee_id), ...absences.map((x) => x.employee_id)]);
  const byEmployee = new Map<number, MonthAttendance>();
  for (const id of ids) {
    byEmployee.set(id, summarize(month, today, toPresence(att.filter((a) => a.employee_id === id)), leaves.filter((l) => l.employee_id === id),
      new Set(absences.filter((x) => x.employee_id === id).map((x) => x.day))));
  }
  return { byEmployee, empty: summarize(month, today, new Map(), []) };
}

// Bir ustanın ayı (təqvim üçün): gün → vəziyyət və saatlar
export async function fetchEmployeeMonth(employeeId: number, month: string) {
  const days = monthDays(month);
  const { att, leaves, absences } = await fetchRange(days[0], days[days.length - 1], employeeId);
  const marked = new Set(absences.map((x) => x.day));
  const today = todayBaku();
  const presence = toPresence(att);
  return {
    summary: summarize(month, today, presence, leaves, marked),
    days: days.map((d) => ({ day: d, status: dayStatus(d, today, presence, leaves, marked), presence: presence.get(d) ?? null })),
  };
}

// attendance və leave_requests dəyişəndə load() çağırılır (Realtime; sessiya ilə qoşulur, yoxsa RLS hadisə göndərmir)
export function useAttendanceLive(load: () => Promise<void>) {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) await supabase.realtime.setAuth(session.access_token);
      await load();
      if (cancelled) return;
      channel = supabase
        .channel(`attendance-${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => void load())
        .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, () => void load())
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance_absences" }, () => void load())
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [load]);
}

// Ayın davamiyyəti (bütün ustalar; standart bu ay), Realtime ilə. Ay dəyişəndə köhnə ayın cavabı göstərilmir.
export function useMonthAttendance(month?: string) {
  const m = month ?? todayBaku().slice(0, 7);
  const [data, setData] = useState<{ month: string; d: Awaited<ReturnType<typeof fetchMonthAttendance>> } | null>(null);
  const load = useCallback(() => fetchMonthAttendance(m).then((d) => setData({ month: m, d })), [m]);
  useAttendanceLive(load);
  return data?.month === m ? data.d : null;
}

export const MONTHS_AZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

// "21.10" / "21.10 – 23.10"
export function leaveRange(l: Pick<Leave, "date_from" | "date_to">) {
  const f = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;
  return l.date_from === l.date_to ? f(l.date_from) : `${f(l.date_from)} – ${f(l.date_to)}`;
}

// "09:02" (Bakı vaxtı)
export function timeBaku(iso: string) {
  return new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

// "09:02 – 18:10" və ya "09:02-dən"
export function presenceText(p: Presence) {
  return p.out ? `${timeBaku(p.in)} – ${timeBaku(p.out)}` : `${timeBaku(p.in)}-dən`;
}
