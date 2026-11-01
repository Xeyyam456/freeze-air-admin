import { Card } from "@/shared/components/Card";
import type { EmployeeListProps } from "@/types/attendance";
import { employeeView } from "../../utils/employeeView";
import { EmployeeCard } from "../EmployeeCard";
import { TodayCell } from "../TodayCell";

// < 1280: hər usta bir kart; göstəricilər (gün) bir sırada (cədvəl dar ekranda yana sürüşürdü, sağ sütunlar görünmürdü)
export function EmployeeCards({ rows, att, isCurrent, meId, canMark, busyId, onOpen, onMark }: EmployeeListProps) {
  return (
    <div className="flex flex-wrap gap-3 xl:hidden">
      {rows === null ? (
        <Card as="p" className="muted w-full py-10 text-center text-sm">Yüklənir...</Card>
      ) : rows.length === 0 ? (
        <Card as="p" className="muted w-full py-10 text-center text-sm">Usta tapılmadı.</Card>
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
