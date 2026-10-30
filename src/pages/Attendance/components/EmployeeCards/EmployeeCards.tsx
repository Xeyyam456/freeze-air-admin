import type { EmployeeListProps } from "@/types/attendance";
import { employeeView } from "../../utils/employeeView";
import { EmployeeCard } from "../EmployeeCard";
import { TodayCell } from "../TodayCell";

// < 1280: hər usta bir kart; göstəricilər (gün) bir sırada (cədvəl dar ekranda yana sürüşürdü, sağ sütunlar görünmürdü)
export function EmployeeCards({ rows, att, isCurrent, meId, canMark, busyId, onOpen, onMark }: EmployeeListProps) {
  return (
    <div className="flex flex-wrap gap-3 xl:hidden">
      {rows === null ? (
        <p className="card muted w-full py-10 text-center text-sm">Yüklənir...</p>
      ) : rows.length === 0 ? (
        <p className="card muted w-full py-10 text-center text-sm">Usta tapılmadı.</p>
      ) : rows.map((e) => {
        const { summary, badge } = employeeView(e, att, isCurrent);
        return (
          <EmployeeCard key={e.id} employee={e} summary={summary} isMe={e.id === meId} onOpen={onOpen}
            cell={badge && <TodayCell employee={e} summary={summary} badge={badge} canMark={canMark} busy={busyId === e.id} onMark={onMark} />} />
        );
      })}
    </div>
  );
}
