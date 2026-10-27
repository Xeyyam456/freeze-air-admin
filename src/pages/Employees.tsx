import { Page } from "@/components/Page";
import { AddEmployeeButton, EmployeeList, type Partner, type TodayStatus } from "@/components/employees/EmployeeForms";
import { listAccountEmails } from "@/actions/accounts";
import { useAuth } from "@/auth/AuthProvider";
import { timeBaku, todayBaku } from "@/lib/attendance";
import { fetchGroupMap } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchEmployees(admin: boolean) {
  const supabase = createClient();
  const today = todayBaku();
  const [{ data: employees }, { data: monthLogs }, { data: attendance }, { data: leaves }, emails, groups] = await Promise.all([
    supabase.from("employees").select("*").eq("is_management", false).eq("is_active", true).order("full_name"),
    // Bu ayın işləri: kartda "bu gün" və "bu ay" sayı
    supabase.from("work_logs").select("id, employee_id, work_date").gte("work_date", `${today.slice(0, 8)}01`),
    // Bu günün davamiyyəti (gündə bir neçə seans ola bilər) və təsdiqlənmiş icazələr
    supabase.from("attendance").select("employee_id, checked_in_at, checked_out_at").eq("day", today),
    supabase.from("leave_requests").select("employee_id").eq("status", "approved").lte("date_from", today).gte("date_to", today),
    // Ustaların giriş hesabları (e-poçt): yalnız admin görür, Edge Function verir
    admin ? listAccountEmails() : Promise.resolve(null),
    fetchGroupMap(`${today.slice(0, 8)}01`),
  ]);

  const todayWork: Record<number, number> = {};
  const monthWork: Record<number, number> = {};
  for (const l of monthLogs ?? []) {
    monthWork[l.employee_id] = (monthWork[l.employee_id] ?? 0) + 1;
    if (l.work_date === today) todayWork[l.employee_id] = (todayWork[l.employee_id] ?? 0) + 1;
  }

  // Birlikdə işləyənlər: eyni qrup işində olan ustalar bir-birinin kartında görünür (ad + bu gün / bu ay neçə iş)
  const members = new Map<string, { ids: Set<number>; today: boolean }>();
  for (const l of monthLogs ?? []) {
    const g = groups.get(l.id);
    if (!g) continue;
    const m = members.get(g) ?? { ids: new Set<number>(), today: false };
    m.ids.add(l.employee_id);
    if (l.work_date === today) m.today = true;
    members.set(g, m);
  }
  const shortName = (id: number) => (employees ?? []).find((e) => e.id === id)?.full_name.split(" ").slice(-1)[0] ?? "—";
  const partners: Record<number, Partner[]> = {};
  for (const m of members.values()) {
    if (m.ids.size < 2) continue;
    for (const id of m.ids) {
      const others = [...m.ids].filter((x) => x !== id).sort((a, b) => a - b);
      const key = others.join("-");
      const list = (partners[id] ??= []);
      const p = list.find((x) => x.key === key);
      if (p) { p.month += 1; if (m.today) p.today += 1; }
      else list.push({ key, names: others.map(shortName).join(" + "), month: 1, today: m.today ? 1 : 0 });
    }
  }

  // Bu günkü vəziyyət: işdədir (açıq seans) → işi bitirib → icazəli → bazar → hələ gəlməyib
  const sunday = new Date(`${today}T12:00:00Z`).getUTCDay() === 0;
  const onLeave = new Set((leaves ?? []).map((l) => l.employee_id));
  const status: Record<number, TodayStatus> = {};
  for (const e of employees ?? []) {
    const rows = (attendance ?? []).filter((a) => a.employee_id === e.id).sort((a, b) => a.checked_in_at.localeCompare(b.checked_in_at));
    const open = rows.find((a) => !a.checked_out_at);
    if (open) status[e.id] = { kind: "in", text: `İşdədir · ${timeBaku(rows[0].checked_in_at)}-dən` };
    else if (rows.length) status[e.id] = { kind: "done", text: `İşi bitirib · ${timeBaku(rows.at(-1)!.checked_out_at!)}` };
    else if (onLeave.has(e.id)) status[e.id] = { kind: "leave", text: "İcazəlidir" };
    else status[e.id] = { kind: "none", text: sunday ? "Bazar günü" : "Hələ gəlməyib" };
  }

  return { employees: employees ?? [], todayWork, monthWork, status, emails, partners };
}

export default function EmployeesPage() {
  const { admin } = useAuth();
  const data = useData("employees-page", () => fetchEmployees(admin), [admin]);

  return (
    <Page title="Ustalar" subtitle="Ustaların ixtisası, təcrübəsi və əlaqə məlumatı" actions={admin ? <AddEmployeeButton /> : undefined}>
      {!data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <EmployeeList
          employees={data.employees}
          todayWork={data.todayWork}
          monthWork={data.monthWork}
          status={data.status}
          partners={data.partners}
          accounts={{ enabled: data.emails !== null, emails: data.emails ?? {} }}
          admin={admin}
        />
      )}
    </Page>
  );
}
