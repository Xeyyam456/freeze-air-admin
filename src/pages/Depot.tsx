import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { AddToolCard, StorekeepersCard, ToolList, type Holding } from "@/components/depot/DepotForms";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchDepot() {
  const supabase = createClient();
  const [{ data: tools }, { data: holdings }, { data: employees }] = await Promise.all([
    // Anbar vəziyyəti: ümumi say, ustalarda, depoda qalan (view tool_stock)
    supabase.from("tool_stock").select("*").order("name"),
    // Hazırda ustalarda olanlar (qaytarılmamış)
    supabase.from("tool_assignments")
      .select("id, tool_id, employee_id, quantity, taken_at, employees(full_name, photo_url)")
      .is("returned_at", null)
      .order("taken_at"),
    supabase.from("employees")
      .select("id, full_name, photo_url, position, is_management, is_storekeeper, user_id")
      .eq("is_active", true)
      .order("full_name"),
  ]);
  return { tools: tools ?? [], holdings: (holdings ?? []) as Holding[], employees: employees ?? [] };
}

export default function DepotPage() {
  const { owner, canManageTools, employeeId } = useAuth();
  const data = useData(fetchDepot);

  return (
    <Page title="Depo" subtitle={canManageTools ? "Alətlər, sayı və kimdə olduğu" : "Alətlərə baxış: dəyişiklikləri depo məsulu edir"}>
      {!data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <WithSidePanel panel={
          <>
            {canManageTools && <AddToolCard />}
            <StorekeepersCard employees={data.employees} owner={owner} selfId={employeeId} />
          </>
        }>
          <ToolList tools={data.tools} holdings={data.holdings} employees={data.employees} canManage={canManageTools} />
        </WithSidePanel>
      )}
    </Page>
  );
}
