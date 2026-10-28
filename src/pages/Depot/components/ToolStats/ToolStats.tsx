import { PackageOpen, Users, Warehouse, Wrench } from "lucide-react";
import type { ToolStatsProps } from "@/types/depot";
import { fmt, withUnit } from "../../utils/quantity";
import { DStat } from "../DStat";

// Alət pəncərəsinin 3 göstəricisi: Depoda, Ustalarda, Təmirdə (alət) | Açıq balonlar / Parçalar (material)
export function ToolStats({ tool, holders, material, piecesTitle }: ToolStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <DStat icon={Warehouse} tone={tool.available > 0 ? "green" : "red"} label="Depoda" value={withUnit(tool.available, tool)} />
      <DStat icon={Users} tone="blue" label="Ustalarda" value={withUnit(tool.given_out, tool)} hint={holders.length ? `${holders.length} usta` : "heç kimdə"} />
      {material
        ? <DStat icon={PackageOpen} tone="violet" label={piecesTitle} value={tool.pieces_count ? `${fmt(tool.pieces_total)} ${tool.unit}` : "—"} hint={tool.pieces_count ? `${tool.pieces_count} ədəd` : undefined} />
        : <DStat icon={Wrench} tone="amber" label="Təmirdə" value={String(tool.in_repair)} />}
    </div>
  );
}
