import { useMemo } from "react";
import { Card } from "@/shared/components/Card";
import type { ErrorCodePanelProps } from "@/types/errorCodes";
import { countByModel } from "../../utils/countByModel";
import { CodeEditor } from "../CodeEditor";
import { ExcelTab } from "../ExcelTab";
import { ModelsTab } from "../ModelsTab";
import { PanelTabs } from "./PanelTabs";

// Sağ panel: pult redaktoru (kod), Excel-dən toplu yükləmə, modellər
export function ErrorCodePanel({ data, map }: ErrorCodePanelProps) {
  const counts = useMemo(() => countByModel(data.codes), [data.codes]);

  return (
    <Card className="space-y-4">
      {/* Dar ekranda pəncərənin X düyməsi sağ yuxarıdadır: tablar onun altına girməsin */}
      <div className="max-lg:pr-9"><PanelTabs tab={map.tab} onTab={map.setTab} /></div>
      {map.tab === "code" && <CodeEditor map={map} />}
      {map.tab === "excel" && <ExcelTab />}
      {map.tab === "models" && <ModelsTab models={data.models} counts={counts} />}
    </Card>
  );
}
