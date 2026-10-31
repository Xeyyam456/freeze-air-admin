import { KeyRound } from "lucide-react";
import type { CardFooterProps } from "@/types/employees";
import { CarBadge } from "./CarBadge";
import { PartnerLine } from "./PartnerLine";

// Kartın altı: tərəfdaşlar, maşın, giriş hesabı vəziyyəti (admin üçün)
export function CardFooter({ employee, partners, accounts, admin }: CardFooterProps) {
  return (
    <>
      {partners.map((p) => <PartnerLine key={p.key} partner={p} />)}
      <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <CarBadge employee={employee} />
        {admin && accounts.enabled && (employee.user_id
          ? <span className="flex items-center gap-1.5 text-ok"><KeyRound size={13} /> Giriş hesabı var</span>
          : <span className="muted flex items-center gap-1.5"><KeyRound size={13} /> Hesab açılmayıb</span>)}
      </span>
    </>
  );
}
