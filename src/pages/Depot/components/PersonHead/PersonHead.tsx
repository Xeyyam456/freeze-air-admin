import { X } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { DepotEmployee } from "@/types/depot";

// Ustanın pəncərəsinin bənövşəyi başlığı: şəkil, ad, vəzifə, bağla + 3 göstərici
export function PersonHead({ emp, toolsN, matsN, waiting, onClose }: { emp: DepotEmployee; toolsN: number; matsN: number; waiting: number; onClose: () => void }) {
  return (
    <div className="-mx-6 -mt-6 max-sm:-mx-4 max-sm:-mt-5 mb-5 overflow-hidden rounded-t-[18px] bg-[linear-gradient(135deg,#7c3aed,#4f46e5_60%,#2563eb)] px-6 max-sm:px-4 pb-5 pt-5 text-white">
      <div className="flex items-start gap-4">
        <Avatar employee={emp} className="!h-14 !w-14 !text-base ring-4 ring-white/25" />
        <div className="min-w-0 flex-1 pt-1">
          <h2 id={`emp-${emp.id}-title`} className="truncate text-xl font-bold leading-tight">{emp.full_name}</h2>
          <p className="truncate text-[13px] text-white/70">{emp.position ?? "Usta"}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {([["Alət", `${toolsN} ədəd`], ["Material", `${matsN} növ`], ["«Aldım» gözləyir", String(waiting)]] as const).map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white/12 px-3.5 py-2.5 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-white/65">{l}</p>
            <p className="text-lg font-extrabold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
