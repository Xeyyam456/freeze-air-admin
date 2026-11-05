import { Link } from "react-router";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { fmt } from "@/pages/Depot/utils/quantity";
import type { LowStockBannerProps } from "@/types/dashboard";
import s from "./LowStockBanner.module.css";

// Depoda azalanlar: minimum qalıq həddinə çatan alət və materiallar (xəbərdarlıq: ikon + mətn, rəng tək deyil)
export function LowStockBanner({ items }: LowStockBannerProps) {
  if (!items.length) return null;
  return (
    <Link to="/depo" className={s.banner}>
      <span className={s.icon}><TriangleAlert size={18} /></span>
      <span className="min-w-0 flex-1">
        <b className={s.title}>Depoda azalıb: {items.length} mövqe</b>
        <span className={s.text}>
          {items.map((t) => `${t.name} (${fmt(t.available + t.pieces_total)} ${t.kind === "material" ? t.unit : "ədəd"} qalıb)`).join(", ")}
        </span>
      </span>
      <ArrowRight size={16} className={s.arrow} />
    </Link>
  );
}
