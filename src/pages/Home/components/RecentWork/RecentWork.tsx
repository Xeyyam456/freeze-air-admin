import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, CalendarClock, CalendarDays, List, Sun } from "lucide-react";
import type { RecentTab, RecentWorkProps } from "@/types/dashboard";
import { addDays } from "../../utils/addDays";
import { DashCard } from "../DashCard";
import { RecentRow } from "./RecentRow";
import s from "./RecentWork.module.css";

const TABS: { key: RecentTab; label: string; icon: typeof Sun }[] = [
  { key: "today", label: "Bu gün", icon: Sun },
  { key: "yesterday", label: "Dünən", icon: CalendarClock },
  { key: "week", label: "Son 7 gün", icon: CalendarDays },
];

// Son işlər: tablar (bu gün / dünən / son 7 gün) + cədvəl; sətrə klik → işin pəncərəsi
export function RecentWork({ rows, today, onOpen, onAll }: RecentWorkProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RecentTab>("today");
  const menu = [
    { label: "Bütün işlər (axtarışla)", icon: List, onSelect: onAll },
    { label: "Görülən işlərə keç", icon: ArrowUpRight, onSelect: () => navigate("/isler") },
  ];
  const from = tab === "week" ? addDays(today, -6) : tab === "yesterday" ? addDays(today, -1) : today;
  const to = tab === "yesterday" ? addDays(today, -1) : today;
  const shown = rows.filter((r) => r.work_date >= from && r.work_date <= to);

  return (
    <DashCard title="Son işlər" subtitle="Ustaların yazdığı işlər" menu={menu} className={s.card}>
      <div className={s.tabs} role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={`${s.tab} ${tab === key ? s.active : ""}`} onClick={() => setTab(key)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <div className={`${s.table} nice-scroll`}>
        <div className={s.headRow}><span>Usta</span><span>İş yeri</span><span>Vaxt</span></div>
        {shown.length === 0 && <p className={s.empty}>Bu dövrdə iş yazılmayıb.</p>}
        {shown.slice(0, 8).map((r) => <RecentRow key={r.id} row={r} onOpen={onOpen} />)}
      </div>
      {shown.length > 8 && <button type="button" className={s.all} onClick={onAll}>Hamısına bax ({shown.length})</button>}
    </DashCard>
  );
}
