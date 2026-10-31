import { Link } from "react-router";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { fmt } from "@/pages/Depot/utils/quantity";
import type { LowStockBannerProps } from "@/types/dashboard";

// Depoda azalanlar: minimum qalıq həddinə çatan alət və materiallar
export function LowStockBanner({ items }: LowStockBannerProps) {
  if (!items.length) return null;
  return (
    <Link to="/depo" className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f5d9a8] bg-[#fff8ec] px-5 py-4 transition-colors hover:bg-[#fff3dc]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fde7bf] text-[#b45309]"><TriangleAlert size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#92400e]">Depoda azalıb: {items.length} mövqe</span>
        <span className="mt-0.5 block text-sm text-[#92400e]/90">
          {items.map((t) => `${t.name} (${fmt(t.available + t.pieces_total)} ${t.kind === "material" ? t.unit : "ədəd"} qalıb)`).join(", ")}
        </span>
      </span>
      <ArrowRight size={16} className="mt-2 shrink-0 text-[#b45309]" />
    </Link>
  );
}
