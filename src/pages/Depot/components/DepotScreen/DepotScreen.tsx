import { useState } from "react";
import { Page } from "@/components/Page";
import { PendingBlock } from "@/pages/Depot/components/PendingBlock";
import { DepotBoard, type DepotView } from "@/components/depot/DepotBoard";
import type { DepotModal, DepotScreenProps, Kind, Tool } from "@/types/depot";
import { isLowStock } from "../../utils/stock";
import { DepotActions } from "./DepotActions";
import { DepotModals } from "./DepotModals";
import { DepotSkeleton } from "./DepotSkeleton";

// Depo ekranı (admin + web ortaq; 2026-10-23 sadələşdirilib; istifadəçi: "uşaq belə rahat istifadə edə bilməlidir"):
// başlıqda Mədaxil + "Daha çox" (Alınmalı, Excel, Jurnal), varsa "Təsdiq gözləyir", altında ümumi baxış və siyahılar.
export function DepotScreen({ data, canManage, myUid, owner, variant, extraActions, extraMenu = [], children }: DepotScreenProps) {
  const [tab, setTab] = useState<DepotView>("home");
  const [openToolId, setOpenToolId] = useState<number | null>(null);
  const [modal, setModal] = useState<DepotModal | null>(null);
  const [receiptTool, setReceiptTool] = useState<Tool | null>(null);
  const kind: Kind = tab === "material" ? "material" : "tool";

  function openReceipt(t: Tool | null) {
    setReceiptTool(t);
    setModal("receipt");
  }

  const tools = data?.tools ?? [];
  const holdings = data?.holdings ?? [];
  const actions = (
    <DepotActions hasData={!!data} low={tools.filter(isLowStock).length} canManage={canManage} variant={variant}
      extraActions={extraActions} extraMenu={extraMenu} onModal={setModal} onReceipt={() => openReceipt(null)} />
  );
  return (
    <Page title="Depo" actions={actions}>
      {!data ? <DepotSkeleton /> : (
        <div className="space-y-5">
          <DepotModals modal={modal} data={data} kind={kind} receiptTool={receiptTool} onReceipt={openReceipt} onClose={() => setModal(null)} />
          {children}
          {/* Yalnız gözləyən varsa görünür */}
          {canManage && <PendingBlock requests={data.requests} holdings={holdings} tools={tools} myUid={myUid} owner={owner} />}
          <DepotBoard tab={tab} onTab={setTab} tools={tools} holdings={holdings} pieces={data.pieces} employees={data.employees}
            requests={data.requests} repairs={data.repairs} losses={data.losses} canManage={canManage}
            openToolId={openToolId} onOpenTool={setOpenToolId} onReceipt={openReceipt}
            onShopping={() => setModal("shopping")} onJournal={() => setModal("journal")} />
        </div>
      )}
    </Page>
  );
}
