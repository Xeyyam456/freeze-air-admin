import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { ErrorCodePanelProps, PanelTab } from "@/types/errorCodes";
import { countByModel } from "../../utils/countByModel";
import { CodeTab } from "../CodeTab";
import { ExcelTab } from "../ExcelTab";
import { ModelsTab } from "../ModelsTab";
import { PanelTabs } from "./PanelTabs";

// Sağ panel: modellər, xəta kodu, Excel
export function ErrorCodePanel({ models, codes }: ErrorCodePanelProps) {
  // Model yoxdursa əvvəl "Modellər" açılır: ilk addım modeli əlavə etməkdir
  const [tab, setTab] = useState<PanelTab>(models.length === 0 ? "models" : "code");
  const counts = useMemo(() => countByModel(codes), [codes]);

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Əlavə et</h2>
      </div>
      <PanelTabs tab={tab} onTab={setTab} />
      {tab === "models" && <ModelsTab models={models} counts={counts} />}
      {tab === "code" && <CodeTab models={models} goModels={() => setTab("models")} />}
      {tab === "excel" && <ExcelTab />}
    </div>
  );
}
