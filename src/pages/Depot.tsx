import { useState } from "react";
import { FileSpreadsheet, History, PackagePlus, Settings2, ShoppingCart } from "lucide-react";
import { Page } from "@/components/Page";
import { useMedia } from "@/lib/navDrawer";
import { PendingBlock } from "@/components/depot/Approvals";
import { DepotBoard, type DepotView } from "@/components/depot/DepotBoard";
import { ReceiptModal } from "@/components/depot/DepotDocs";
import { ExcelModal } from "@/components/depot/DepotExcel";
import { MoreMenu, ShoppingModal } from "@/components/depot/DepotExtras";
import { KeeperModal } from "@/components/depot/DepotForms";
import { HistoryModal } from "@/components/depot/HistoryModal";
import { isLowStock, type DepotRequest, type Holding, type Kind, type Piece, type Loss, type Repair, type Tool } from "@/components/depot/depotUtils";
import { listAccountEmails } from "@/actions/accounts";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchDepot(admin: boolean) {
  const supabase = createClient();
  const [{ data: tools }, { data: holdings }, { data: employees }, { data: pieces }, { data: requests }, { data: repairs }, { data: losses }, emails] = await Promise.all([
    // Anbar vəziyyəti: ümumi say, ustalarda, təmirdə, depoda qalan (view tool_stock)
    supabase.from("tool_stock").select("*").order("name"),
    // Hazırda ustalarda olanlar (qaytarılmamış); received_at/disputed_at: ustanın "Aldım / Almadım" cavabı
    supabase.from("tool_assignments")
      .select("id, tool_id, employee_id, quantity, taken_at, received_at, disputed_at, employees(full_name, photo_url)")
      .is("returned_at", null)
      .order("taken_at"),
    supabase.from("employees")
      .select("id, full_name, photo_url, position, is_management, is_storekeeper, user_id")
      .eq("is_active", true)
      .order("full_name"),
    // Depodakı material parçaları / açıq balonlar
    supabase.from("material_pieces").select("id, tool_id, length, original_length, created_at, employees(full_name)").order("created_at"),
    // Təsdiq gözləyən sənədlər (0084)
    supabase.from("depot_requests").select("*").eq("status", "pending").order("created_at"),
    supabase.from("tool_repairs").select("*").is("returned_at", null).order("sent_at"),
    // Təsdiqlənmiş silinmələr (xarab, itib, oğurlanıb; "sərf olunub" yox): siyahıda və alət pəncərəsində səbəb göstərilir
    supabase.from("depot_requests").select("tool_id, quantity, reason, note, decided_at").eq("type", "writeoff").eq("status", "approved").neq("reason", "used").order("decided_at", { ascending: false }),
    // Depo məsullarının giriş hesabları (e-poçt): yalnız admin görür, Edge Function verir
    admin ? listAccountEmails() : Promise.resolve(null),
  ]);
  return {
    tools: (tools ?? []) as Tool[], holdings: (holdings ?? []) as Holding[], pieces: (pieces ?? []) as Piece[], employees: employees ?? [],
    requests: (requests ?? []) as DepotRequest[], repairs: (repairs ?? []) as Repair[], losses: (losses ?? []) as Loss[], emails,
  };
}

// Depo (2026-10-23 sadələşdirilib; istifadəçi: "uşaq belə rahat istifadə edə bilməlidir"):
// başlıqda Mədaxil + "Daha çox" (Sayım, Alınmalı, Excel, Jurnal), varsa "Təsdiq gözləyir", altında üç tab və sadə kartlar.
export default function DepotPage() {
  const { admin, owner, canManageTools, employeeId, session } = useAuth();
  const data = useData(() => fetchDepot(admin), [admin]);
  const [tab, setTab] = useState<DepotView>("home");
  const [openToolId, setOpenToolId] = useState<number | null>(null);
  const [modal, setModal] = useState<"receipt" | "shopping" | "keeper" | "journal" | "excel" | null>(null);
  const [receiptTool, setReceiptTool] = useState<Tool | null>(null);
  const kind: Kind = tab === "material" ? "material" : "tool";

  function openReceipt(t: Tool | null) {
    setReceiptTool(t);
    setModal("receipt");
  }

  const tools = data?.tools ?? [];
  const holdings = data?.holdings ?? [];
  const low = tools.filter(isLowStock).length;

  const tiny = useMedia("(width < 380px)");
  return (
    <Page title="Depo"
      actions={
        <span className="flex items-center gap-2 max-sm:gap-1.5">
          {canManageTools && admin && !tiny && (
            <button type="button" onClick={() => setModal("keeper")} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20" title="Depo məsulu" aria-label="Depo məsulu">
              <Settings2 size={18} />
            </button>
          )}
          {data && (
            <MoreMenu dark items={[
              ...(canManageTools && admin && tiny ? [{ label: "Depo məsulu", icon: Settings2, onClick: () => setModal("keeper") }] : []),
              { label: "Alınmalı", icon: ShoppingCart, onClick: () => setModal("shopping"), badge: low },
              { label: "Excel", icon: FileSpreadsheet, onClick: () => setModal("excel") },
              { label: "Jurnal", icon: History, onClick: () => setModal("journal") },
            ]} />
          )}
          {canManageTools && <button type="button" onClick={() => openReceipt(null)} className="hero-action max-sm:!w-10 max-sm:justify-center max-sm:!px-0" aria-label="Mədaxil"><PackagePlus size={17} /> <span className="max-sm:hidden">Mədaxil</span></button>}
        </span>
      }>
      {!data ? (
        <div className="space-y-4">
          <div className="h-14 animate-pulse rounded-xl bg-line/60" />
          <div className="h-[220px] animate-pulse rounded-2xl bg-line/60" />
        </div>
      ) : (
        <div className="space-y-5">
          {modal === "receipt" && (
            <ReceiptModal tools={tools} initialKind={(receiptTool?.kind as Kind) ?? kind} initialToolId={receiptTool?.id ?? null} onClose={() => setModal(null)} />
          )}
          {modal === "shopping" && <ShoppingModal tools={tools} onReceipt={(t) => openReceipt(t)} onClose={() => setModal(null)} />}
          {modal === "journal" && <HistoryModal kind={kind} onClose={() => setModal(null)} />}
          {modal === "excel" && <ExcelModal tools={tools} holdings={holdings} employees={data.employees} onClose={() => setModal(null)} />}
          {modal === "keeper" && (
            <KeeperModal employees={data.employees} accounts={{ enabled: data.emails !== null, emails: data.emails ?? {} }} selfId={employeeId} onClose={() => setModal(null)} />
          )}

          {/* Yalnız gözləyən varsa görünür */}
          {canManageTools && <PendingBlock requests={data.requests} holdings={holdings} tools={tools} myUid={session?.user.id ?? null} owner={owner} />}

          <DepotBoard tab={tab} onTab={setTab} tools={tools} holdings={holdings} pieces={data.pieces} employees={data.employees}
            requests={data.requests} repairs={data.repairs} losses={data.losses} canManage={canManageTools}
            openToolId={openToolId} onOpenTool={setOpenToolId} onReceipt={openReceipt}
            onShopping={() => setModal("shopping")} onJournal={() => setModal("journal")} />
        </div>
      )}
    </Page>
  );
}
