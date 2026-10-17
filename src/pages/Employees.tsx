import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { AddEmployeeCard, EmployeeList, type HeldTool } from "@/components/employees/EmployeeForms";
import { listAccountEmails } from "@/actions/accounts";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchEmployees(admin: boolean) {
  const supabase = createClient();
  const [{ data: employees }, { data: assignments }, { data: freeTools }, { data: todayLogs }, emails] = await Promise.all([
    supabase.from("employees").select("*").eq("is_management", false).eq("is_active", true).order("full_name"),
    // Hazırda ustalarda olan alətlər (qaytarılmamış)
    supabase
      .from("tool_assignments")
      .select("id, employee_id, quantity, taken_at, tools(id, name, inventory_code, kind, unit, pack_name, pack_size)")
      .is("returned_at", null)
      .order("taken_at"),
    // Depoda boş ədədi olan alətlər: ustaya vermək üçün
    supabase.from("tool_stock").select("id, name, available").eq("kind", "tool").gt("available", 0).order("name"),
    // Bu gün yazılan işlər: kartda say göstərilir
    supabase.from("work_logs").select("employee_id").eq("work_date", todayIso()),
    // Ustaların giriş hesabları (e-poçt): yalnız admin görür, Edge Function verir
    admin ? listAccountEmails() : Promise.resolve(null),
  ]);

  const toolsByEmployee: Record<number, HeldTool[]> = {};
  for (const a of assignments ?? []) {
    if (!a.tools) continue;
    (toolsByEmployee[a.employee_id] ??= []).push({ ...a.tools, assignmentId: a.id, quantity: a.quantity, taken_at: a.taken_at });
  }
  const todayWork: Record<number, number> = {};
  for (const l of todayLogs ?? []) todayWork[l.employee_id] = (todayWork[l.employee_id] ?? 0) + 1;

  return { employees: employees ?? [], toolsByEmployee, todayWork, freeTools: freeTools ?? [], emails };
}

export default function EmployeesPage() {
  const { admin, canManageTools } = useAuth();
  const data = useData(() => fetchEmployees(admin), [admin]);

  return (
    <Page title="Ustalar" subtitle="Ustaların ixtisası, təcrübəsi və əlaqə məlumatı">
      {!data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <WithSidePanel panel={admin ? <AddEmployeeCard /> : null}>
          <EmployeeList
            employees={data.employees}
            toolsByEmployee={data.toolsByEmployee}
            todayWork={data.todayWork}
            freeTools={data.freeTools}
            accounts={{ enabled: data.emails !== null, emails: data.emails ?? {} }}
            admin={admin}
            canManageTools={canManageTools}
          />
        </WithSidePanel>
      )}
    </Page>
  );
}
