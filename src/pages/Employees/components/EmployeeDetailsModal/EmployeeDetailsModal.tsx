import { useState } from "react";
import { WorkTab } from "@/components/work/WorkTab";
import { Avatar } from "@/shared/components/Avatar";
import { Modal } from "@/shared/components/Modal";
import { ProfileBanner } from "@/shared/components/ProfileBanner";
import { workerTypeLabel } from "@/shared/utils/workerType";
import type { DetailsTab, EmployeeDetailsModalProps } from "@/types/employees";
import { AboutTab } from "./AboutTab";
import { DetailsTabs } from "./DetailsTabs";

// Usta kartına klikləyəndə açılan məlumat pəncərəsi
export function EmployeeDetailsModal({ employee, accounts, admin, onClose }: EmployeeDetailsModalProps) {
  const [tab, setTab] = useState<DetailsTab>("about");

  return (
    <Modal onClose={onClose} labelledBy={`emp-${employee.id}-title`} className="!max-w-2xl overflow-hidden !p-0">
      <ProfileBanner onClose={onClose} />
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={employee} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`emp-${employee.id}-title`} className="mt-3 text-xl font-bold">{employee.full_name}</h2>
        <p className="muted text-sm"><span className="mr-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{workerTypeLabel(employee.worker_type)}</span>{employee.specialty ?? "İxtisas yazılmayıb"}</p>

        <DetailsTabs tab={tab} onTab={setTab} />

        {/* Bütün tablar eyni hündürlükdədir ki, keçid zamanı pəncərə tullanmasın */}
        <div className="mt-3 h-[min(340px,calc(100vh/var(--zoom)-330px))] text-left text-sm">
          {tab === "about"
            ? <AboutTab employee={employee} accounts={accounts} admin={admin} />
            : <WorkTab employeeId={employee.id} employeeName={employee.full_name} admin={admin} />}
        </div>
      </div>
    </Modal>
  );
}
