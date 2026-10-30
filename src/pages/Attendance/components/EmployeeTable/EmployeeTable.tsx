import type { EmployeeListProps } from "@/types/attendance";
import { employeeView } from "../../utils/employeeView";
import { EmployeeRow } from "../EmployeeRow";
import { TodayCell } from "../TodayCell";

// ≥ 1280: bütün ustaların cədvəli (iş günü, işdə, icazə, icazəsiz, cəmi, bazar, bu gün)
export function EmployeeTable({ rows, att, isCurrent, meId, canMark, busyId, onOpen, onMark }: EmployeeListProps) {
  return (
    <div className="card overflow-x-auto !p-0 max-xl:hidden">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-line bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
            <th className="px-4 py-2.5">Usta</th>
            <th className="px-2 py-2.5 text-center" title="Ayın bu günə qədər iş günləri (B.e.–Şənbə)">İş günü</th>
            <th className="px-2 py-2.5 text-center">İşdə olub</th>
            <th className="px-2 py-2.5 text-center">İcazə aldı</th>
            <th className="px-2 py-2.5 text-center" title="İş günü gəlməyib, icazəsi də yoxdur">İcazəsiz qalıb</th>
            <th className="px-2 py-2.5 text-center" title="Ay ərzində işdə olmadığı bütün iş günləri: icazəli + icazəsiz">İşdə olmayıb (cəmi)</th>
            <th className="px-2 py-2.5 text-center">Bazar günü işə çıxıb</th>
            <th className="px-4 py-2.5 text-right">{isCurrent ? "Bu gün" : ""}</th>
          </tr>
        </thead>
        <tbody>
          {rows === null ? (
            <tr><td colSpan={8} className="muted py-10 text-center">Yüklənir...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={8} className="muted py-10 text-center">Usta tapılmadı.</td></tr>
          ) : rows.map((e) => {
            const { summary, badge } = employeeView(e, att, isCurrent);
            return (
              <EmployeeRow key={e.id} employee={e} summary={summary} isMe={e.id === meId} onOpen={onOpen}
                cell={<TodayCell employee={e} summary={summary} badge={badge} canMark={canMark} busy={busyId === e.id} onMark={onMark} />} />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
