import { useState } from "react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { AddToolCard, KeepersPanel, KindTabs, ToolList, type Holding, type Kind, type Piece } from "@/components/depot/DepotForms";
import { listAccountEmails } from "@/actions/accounts";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchDepot(admin: boolean) {
  const supabase = createClient();
  const [{ data: tools }, { data: holdings }, { data: employees }, { data: pieces }, emails] = await Promise.all([
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
    // Depodakı material parçaları (usta işlədib, qalanını təhvil verib)
    supabase.from("material_pieces").select("id, tool_id, length, original_length, created_at, employees(full_name)").order("created_at"),
    // Depo məsullarının giriş hesabları (e-poçt): yalnız admin görür, Edge Function verir
    admin ? listAccountEmails() : Promise.resolve(null),
  ]);
  return { tools: tools ?? [], holdings: (holdings ?? []) as Holding[], pieces: (pieces ?? []) as Piece[], employees: employees ?? [], emails };
}

export default function DepotPage() {
  const { admin, canManageTools, employeeId } = useAuth();
  const data = useData(() => fetchDepot(admin), [admin]);
  // Alətlər / Materiallar tabı: həm siyahı, həm "Yeni ..." forması bununla dəyişir
  const [kind, setKind] = useState<Kind>("tool");
  // "Depo məsulu" tabı (yalnız admin): əsas sahədə depoçu yaratma və hesab idarəsi
  const [keepers, setKeepers] = useState(false);
  const pickKind = (k: Kind) => { setKind(k); setKeepers(false); };

  return (
    <Page title="Depo" subtitle={canManageTools ? "Alətlər və materiallar, sayı və kimdə olduğu" : "Depoya baxış: dəyişiklikləri depo məsulu edir"}>
      {!data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        keepers && admin ? (
          <KeepersPanel tabs={<KindTabs kind="keepers" onKind={pickKind} onKeepers={() => setKeepers(true)} />}
            employees={data.employees} accounts={{ enabled: data.emails !== null, emails: data.emails ?? {} }} selfId={employeeId} />
        ) : (
          <WithSidePanel panel={
            canManageTools ? <AddToolCard kind={kind} onKind={pickKind} names={data.tools.filter((t) => t.kind === kind).map((t) => t.name)} /> : null
          }>
            <ToolList kind={kind} onKind={pickKind} onKeepers={admin ? () => setKeepers(true) : undefined} tools={data.tools} holdings={data.holdings} pieces={data.pieces} employees={data.employees} canManage={canManageTools} />
          </WithSidePanel>
        )
      )}
    </Page>
  );
}
