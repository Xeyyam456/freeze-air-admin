import { AlertTriangle, Clock, Hourglass, Package, Users, Warehouse, Wrench } from "lucide-react";
import type { BoardHomeProps } from "@/types/depot";
import { STALE_DAYS } from "../../constants/limits";
import { inStock } from "../../utils/inStock";
import { fmt } from "../../utils/quantity";
import { AttentionCard } from "../AttentionCard";
import { HubTile } from "../HubTile";
import { RecentMovements } from "../RecentMovements";

// Ümumi baxış (depo açılanda): 3 kafel (Alətlər, Materiallar, Ustalar), altında Diqqət və Son hərəkətlər yan-yana
export function BoardHome({ b, onTab, onShopping, onJournal }: BoardHomeProps) {
  const { tDepot, tGiven, tRepair, mats, outN, unconfirmedN, staleN } = b;
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        <HubTile icon={Wrench} tone="blue" title="Alətlər" big={tDepot + tGiven + tRepair} unit="ədəd" onClick={() => onTab("tool")}
          bar={[{ n: tDepot, c: "bg-[#22c55e]" }, { n: tGiven, c: "bg-[#3b82f6]" }, { n: tRepair, c: "bg-[#f59e0b]" }]}
          rows={[
            { label: "Depoda", value: fmt(tDepot), dot: "bg-[#22c55e]" },
            { label: "Ustalarda", value: fmt(tGiven), dot: "bg-[#3b82f6]" },
            { label: "Təmirdə", value: fmt(tRepair), dot: "bg-[#f59e0b]" },
          ]} />
        <HubTile icon={Package} tone="teal" title="Materiallar" big={mats.length} unit="növ" onClick={() => onTab("material")}
          rows={[
            { label: "Depoda var", value: String(mats.filter((t) => inStock(t) > 0).length), dot: "bg-[#22c55e]" },
            { label: "Ustalarda var", value: String(mats.filter((t) => t.given_out > 0).length), dot: "bg-[#3b82f6]" },
            { label: "Qalmayıb", value: String(mats.filter((t) => inStock(t) === 0).length), dot: "bg-[#ef4444]" },
          ]} />
        <HubTile icon={Users} tone="violet" title="Ustalar" big={b.masters.length} unit="usta" onClick={() => onTab("people")}
          rows={[
            { label: "Üzərində alət/material olan", value: String(b.holdersCount), dot: "bg-[#8b5cf6]" },
            { label: "«Aldım» gözləyir", value: String(unconfirmedN), dot: "bg-[#f59e0b]" },
            { label: `${STALE_DAYS}+ gündür ustada`, value: String(staleN), dot: "bg-[#94a3b8]" },
          ]} />
      </div>
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <AttentionCard items={[
          { icon: AlertTriangle, tone: "amber", label: "Azalıb", hint: "minimum qalığa çatıb: alınmalıdır", n: b.lowN, onClick: onShopping },
          { icon: Warehouse, tone: "red", label: "Qalmayıb", hint: "heç yerdə yoxdur", n: outN, onClick: () => onTab(outN && mats.some((t) => inStock(t) === 0 && t.given_out === 0) ? "material" : "tool") },
          { icon: Hourglass, tone: "blue", label: "«Aldım» gözləyir", hint: "usta hələ təsdiqləməyib", n: unconfirmedN, onClick: () => onTab("people") },
          { icon: Clock, tone: "slate", label: `${STALE_DAYS}+ gündür ustada`, hint: "uzun müddət qaytarılmayan", n: staleN, onClick: () => onTab("people") },
        ]} />
        <RecentMovements onOpenAll={onJournal} limit={5} />
      </div>
    </>
  );
}
