import { FileSpreadsheet, History, PackagePlus, ShoppingCart } from "lucide-react";
import { MoreMenu } from "@/components/depot/DepotExtras";
import { Button } from "@/shared/components/Button";
import type { DepotActionsProps } from "@/types/depot";

// Başlığın sağı: (admin: ⚙) + "Daha çox" (Alınmalı, Excel, Jurnal) + Mədaxil
export function DepotActions({ hasData, low, canManage, variant, extraActions, extraMenu, onModal, onReceipt }: DepotActionsProps) {
  const admin = variant === "admin";
  return (
    <span className={admin ? "flex items-center gap-2 max-sm:gap-1.5" : "flex items-center gap-2"}>
      {extraActions}
      {hasData && (
        <MoreMenu dark={admin} items={[
          ...extraMenu,
          { label: "Alınmalı", icon: ShoppingCart, onClick: () => onModal("shopping"), badge: low },
          { label: "Excel", icon: FileSpreadsheet, onClick: () => onModal("excel") },
          { label: "Jurnal", icon: History, onClick: () => onModal("journal") },
        ]} />
      )}
      {admin && canManage && (
        <button type="button" onClick={onReceipt} className="hero-action max-sm:!w-10 max-sm:justify-center max-sm:!px-0" aria-label="Mədaxil">
          <PackagePlus size={17} /> <span className="max-sm:hidden">Mədaxil</span>
        </button>
      )}
      {!admin && <Button size="sm" onClick={onReceipt} className="!h-10 shrink-0"><PackagePlus size={16} /> Mədaxil</Button>}
    </span>
  );
}
