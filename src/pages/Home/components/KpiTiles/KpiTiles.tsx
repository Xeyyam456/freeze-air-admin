import { ClipboardList, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { KpiTilesProps } from "@/types/dashboard";
import { DashTile } from "../DashTile";

// 3 xana: iş sayı (əvvəlki aya görə fərq), iş yazan usta, fərqli yer
export function KpiTiles({ s, diff }: KpiTilesProps) {
  return (
    <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-sm:gap-2.5">
      <DashTile icon={ClipboardList} label="İş sayı" value={String(s.total)}>
        <span className={`flex items-center gap-1 ${diff > 0 ? "text-emerald-300" : diff < 0 ? "text-rose-300" : "text-white/60"}`}>
          {diff > 0 ? <TrendingUp size={13} /> : diff < 0 ? <TrendingDown size={13} /> : null}
          {diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : "Eyni"} <span className="font-medium text-white/50">əvvəlki aya görə</span>
        </span>
      </DashTile>
      <DashTile icon={Users} label="İş yazan usta" value={`${s.active}`}>
        <span className="font-medium text-white/50">{s.masters} ustadan</span>
      </DashTile>
      <DashTile icon={MapPin} label="Fərqli yer" value={String(s.places)}>
        <span className="font-medium text-white/50">şirkət, filial, mağaza</span>
      </DashTile>
    </div>
  );
}
