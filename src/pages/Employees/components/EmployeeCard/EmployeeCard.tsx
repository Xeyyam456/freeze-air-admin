import { useState } from "react";
import { PersonCard } from "@/shared/components/PersonCard";
import { workerTypeLabel } from "@/shared/utils/workerType";
import type { EmployeeCardProps } from "@/types/employees";
import { EditEmployeeModal } from "../EditEmployeeModal";
import { EmployeeDetailsModal } from "../EmployeeDetailsModal";
import { CardActions } from "./CardActions";
import { CardFooter } from "./CardFooter";

export function EmployeeCard({ employee, todayCount, monthCount, status, partners, accounts, admin }: EmployeeCardProps) {
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);

  return (
    <>
      {/* Modallar kartın çölündədir: içlərindəki kliklər karta keçib detalları yenidən açmasın */}
      {viewing && <EmployeeDetailsModal employee={employee} accounts={accounts} admin={admin} onClose={() => setViewing(false)} />}
      {editing && <EditEmployeeModal employee={employee} onClose={() => setEditing(false)} />}
      <PersonCard
        person={employee}
        badge={workerTypeLabel(employee.worker_type)}
        subtitle={employee.specialty ?? "İxtisas yazılmayıb"}
        status={status}
        stats={[
          { label: "Bu gün iş", value: todayCount, tone: todayCount ? "text-ok" : "" },
          { label: "Bu ay iş", value: monthCount, tone: monthCount ? "text-primary" : "" },
        ]}
        actions={admin && <CardActions employee={employee} onEdit={() => setEditing(true)} />}
        footer={<CardFooter employee={employee} partners={partners} accounts={accounts} admin={admin} />}
        onOpen={() => setViewing(true)}
      />
    </>
  );
}
