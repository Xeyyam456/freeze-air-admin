import { Briefcase, CalendarDays, Car, Phone } from "lucide-react";
import { experience } from "@/lib/experience";
import { AccountSection } from "@/shared/components/AccountSection";
import { InfoCell } from "@/shared/components/InfoCell";
import { formatDate } from "@/shared/utils/formatDate";
import type { AboutTabProps } from "@/types/employees";
import { CarInfo } from "./CarInfo";

// "Haqqında" tabı: təcrübə, başlama tarixi, telefon, maşın və (admin üçün) giriş hesabı
export function AboutTab({ employee, accounts, admin }: AboutTabProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <InfoCell icon={Briefcase} label="Təcrübə"><p className="font-semibold">{experience(employee.start_date) ?? "—"}</p></InfoCell>
      <InfoCell icon={CalendarDays} label="İşə başlayıb"><p className="font-semibold">{formatDate(employee.start_date) ?? "—"}</p></InfoCell>
      <InfoCell icon={Phone} label="Telefon" className="max-sm:col-span-2">
        {employee.phone
          ? <a href={`tel:${employee.phone}`} className="link whitespace-nowrap max-sm:text-[13px]">{employee.phone}</a>
          : <p className="font-semibold">—</p>}
      </InfoCell>
      <InfoCell icon={Car} label="Maşın" className="max-sm:col-span-2"><CarInfo employee={employee} /></InfoCell>
      {admin && (
        <div className="col-span-2">
          <AccountSection employeeId={employee.id} email={accounts.emails[employee.id] ?? null}
            hasAccount={!!employee.user_id} enabled={accounts.enabled} />
        </div>
      )}
    </div>
  );
}
