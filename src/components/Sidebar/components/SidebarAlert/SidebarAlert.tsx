import { Link } from "react-router";
import { ArrowRight, TriangleAlert } from "lucide-react";
import type { SidebarAlertProps } from "@/types/layout";
import s from "../../styles/Sidebar.module.css";

// Menyunun altında depo xəbərdarlığı (azalan, təsdiq gözləyən sənəd, «Almadım»): klik → Depo.
// Yığılmış menyuda yalnız nəbz vuran ikon qalır.
export function SidebarAlert({ count, title, collapsed }: SidebarAlertProps) {
  if (!count) return null;
  return (
    <Link to="/depo" className={s.alert} title={collapsed ? `Depoda diqqət: ${title}` : undefined}>
      <span className={s.alertIcon}><TriangleAlert size={16} /></span>
      <span className={`${s.text} ${s.alertBody}`}>
        <b>Depoda diqqət · {count}</b>
        <small>{title}</small>
      </span>
      <ArrowRight size={14} className={`${s.text} ${s.alertArrow}`} />
    </Link>
  );
}
