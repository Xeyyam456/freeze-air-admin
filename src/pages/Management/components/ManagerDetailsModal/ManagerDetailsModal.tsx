import { Briefcase, CalendarDays, Phone } from "lucide-react";
import { experience } from "@/lib/experience";
import { AccountSection } from "@/shared/components/AccountSection";
import { Avatar } from "@/shared/components/Avatar";
import { InfoCell } from "@/shared/components/InfoCell";
import { Modal } from "@/shared/components/Modal";
import { ProfileBanner } from "@/shared/components/ProfileBanner";
import { formatDate } from "@/shared/utils/formatDate";
import type { ManagerDetailsModalProps } from "@/types/management";
import { ACCOUNT_NOTE } from "../../constants/accountNote";

export function ManagerDetailsModal({ manager, accounts, canEdit, onClose }: ManagerDetailsModalProps) {
  return (
    <Modal onClose={onClose} labelledBy={`mgr-${manager.id}-title`} className="!max-w-xl overflow-hidden !p-0">
      <ProfileBanner onClose={onClose} />
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={manager} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`mgr-${manager.id}-title`} className="mt-3 text-xl font-bold">{manager.full_name}</h2>
        <p className="muted text-sm">{manager.position}</p>

        <div className="mt-5 grid grid-cols-2 gap-2 text-left text-sm">
          <InfoCell icon={Briefcase} label="Təcrübə"><p className="font-semibold">{experience(manager.start_date) ?? "—"}</p></InfoCell>
          <InfoCell icon={CalendarDays} label="İşə başlayıb"><p className="font-semibold">{formatDate(manager.start_date) ?? "—"}</p></InfoCell>
          <InfoCell icon={Phone} label="Telefon" className="col-span-2">
            {manager.phone
              ? <a href={`tel:${manager.phone}`} className="link">{manager.phone}</a>
              : <p className="font-semibold">—</p>}
          </InfoCell>
          {canEdit && (
            <div className="col-span-2">
              <AccountSection employeeId={manager.id} email={accounts.emails[manager.id] ?? null}
                hasAccount={!!manager.user_id} enabled={accounts.enabled} note={ACCOUNT_NOTE} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
