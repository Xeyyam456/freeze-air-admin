import type { DepotBoardState, Loss } from "@/types/depot";
import { MaterialRow } from "../MaterialRow";
import { ToolRow } from "../ToolRow";

// Alətlər / Materiallar cədvəli (materialın öz sütunları var); sətrə basanda alətin pəncərəsi, "Ver" → sürətli vermə
export function ToolsTable({ b, losses, canManage, onOpenTool }: { b: DepotBoardState; losses: Loss[]; canManage: boolean; onOpenTool: (id: number) => void }) {
  const material = b.kind === "material";
  return (
    <table className="w-full border-t border-line text-sm">
      <thead className="sticky top-[var(--header-h)] z-10 bg-[#f8fafc] text-left text-xs font-semibold text-muted">
        {material ? (
          <tr>
            <th className="py-3 pl-5 pr-3">Material</th>
            <th className="w-32 px-3 py-3 text-right">Depoda (tam)</th>
            <th className="w-32 px-3 py-3 text-right max-lg:hidden">Parça / açıq</th>
            <th className="w-28 px-3 py-3 text-right">Ustalarda</th>
            <th className="w-40 px-3 py-3 max-xl:hidden">Doluluq</th>
            <th className="w-36 px-3 py-3 max-md:hidden">Vəziyyət</th>
            <th className="w-24 py-3 pl-3 pr-5" />
          </tr>
        ) : (
          <tr>
            <th className="py-3 pl-5 pr-3">Ad</th>
            <th className="w-32 px-3 py-3 text-right">Depoda</th>
            <th className="w-32 px-3 py-3 text-right">Ustalarda</th>
            <th className="w-40 px-3 py-3 max-md:hidden">Vəziyyət</th>
            <th className="w-24 py-3 pl-3 pr-5" />
          </tr>
        )}
      </thead>
      <tbody>
        {b.shown.map((t) => {
          const Row = material ? MaterialRow : ToolRow;
          return <Row key={t.id} t={t} losses={losses.filter((l) => l.tool_id === t.id)} canManage={canManage} onOpen={() => onOpenTool(t.id)} onGive={() => b.setQuickId(t.id)} />;
        })}
      </tbody>
    </table>
  );
}
