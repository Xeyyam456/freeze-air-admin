import { useState } from "react";
import { KIND } from "@/lib/kinds";
import type { StoreScopeProps, StoreToolsTab } from "@/types/clients";
import { StoreImport } from "../StoreImport";
import { AddStoreForm } from "./AddStoreForm";
import { StoreToolsTabs } from "./StoreToolsTabs";
import { Card } from "@/shared/components/Card";

// "Yeni mağaza/filial" və "Excel" bir kartda, tablarla: sağ panel ekrana sığsın deyə.
export function StoreTools({ companyId, kind }: StoreScopeProps) {
  const [tab, setTab] = useState<StoreToolsTab>("single");

  return (
    <Card className="!py-4">
      <StoreToolsTabs tab={tab} onTab={setTab} unit={KIND[kind].unit} />
      {tab === "single"
        ? <AddStoreForm companyId={companyId} kind={kind} />
        : <StoreImport companyId={companyId} kind={kind} />}
    </Card>
  );
}
