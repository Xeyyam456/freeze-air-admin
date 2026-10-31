import { MapPin, Phone, User } from "lucide-react";
import type { ClientContactCellsProps } from "@/types/clients";

// Əlaqəli şəxs, telefon və (şirkətdə) ünvan xanaları
export function ClientContactCells({ company, kind }: ClientContactCellsProps) {
  return (
    <>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-sm max-sm:grid-cols-1">
        <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><User size={13} /> Əlaqəli şəxs</p>
          <p className="font-semibold leading-tight [overflow-wrap:anywhere] sm:truncate">{company.contact_person ?? "—"}</p>
        </div>
        <div className="rounded-xl bg-bg px-3 py-2">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
          {company.phone
            ? <a href={`tel:${company.phone}`} className="link block whitespace-nowrap">{company.phone}</a>
            : <p className="font-semibold">—</p>}
        </div>
      </div>
      {kind === "company" && (
        <div className="mt-2 min-w-0 rounded-xl bg-bg px-3 py-2 text-sm">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><MapPin size={13} /> Ünvan</p>
          <p className="truncate font-semibold">{company.address ?? "—"}</p>
        </div>
      )}
    </>
  );
}
