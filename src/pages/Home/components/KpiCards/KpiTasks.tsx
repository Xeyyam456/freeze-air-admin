import { Link } from "react-router";
import type { KpiProps } from "@/types/dashboard";
import { CountUp } from "@/components/CountUp";
import { DashCard } from "../DashCard";
import s from "./KpiCards.module.css";

// Bugünkü tapşırıqlar: neçəsi görülüb (qrup tapşırığı bir say)
export function KpiTasks({ d }: KpiProps) {
  const tasks = d?.tasks ?? [];
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return (
    <DashCard>
      <div className={s.value}><b><CountUp value={tasks.length} duration={1400} /></b></div>
      <p className={s.label}>Bugünkü tapşırıq</p>
      <Link to="/tapshiriqlar" className={s.progress}>
        <span className={s.progressText}><span>{done} / {tasks.length} görülüb</span><b><CountUp value={pct} duration={1400} />%</b></span>
        <span className={s.track}><span style={{ width: `${pct}%` }} /></span>
      </Link>
    </DashCard>
  );
}
