import { ReceiptModal } from "@/pages/Depot/components/ReceiptModal";
import { ExcelModal } from "@/pages/Depot/components/ExcelModal";
import { ShoppingModal } from "@/pages/Depot/components/ShoppingModal";
import { HistoryModal } from "@/pages/Depot/components/HistoryModal";
import type { DepotModalsProps, Kind } from "@/types/depot";

// Başlıqdan açılan pəncərələr: Mədaxil, Alınmalı, Jurnal, Excel
export function DepotModals({ modal, data, kind, receiptTool, onReceipt, onClose }: DepotModalsProps) {
  if (modal === "receipt") {
    return <ReceiptModal tools={data.tools} initialKind={(receiptTool?.kind as Kind) ?? kind} initialToolId={receiptTool?.id ?? null} onClose={onClose} />;
  }
  if (modal === "shopping") return <ShoppingModal tools={data.tools} onReceipt={onReceipt} onClose={onClose} />;
  if (modal === "journal") return <HistoryModal kind={kind} onClose={onClose} />;
  if (modal === "excel") return <ExcelModal tools={data.tools} holdings={data.holdings} employees={data.employees} onClose={onClose} />;
  return null;
}
