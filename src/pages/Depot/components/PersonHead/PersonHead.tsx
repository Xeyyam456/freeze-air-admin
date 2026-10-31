import { X } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { PersonHeadProps } from "@/types/depot";

// Ustanın pəncərəsinin bənövşəyi başlığı: şəkil, ad, vəzifə, bağla + 3 göstərici
export function PersonHead({ emp, toolsN, matsN, waiting, onClose }: PersonHeadProps) {
  return (
    <div className="-mx-6 -mt-6 max-sm:-mx-4 max-sm:-mt-5 mb-5 overflow-hidden rounded-t-[18px] bg-[linear-gradient(135deg,#7c3aed,#4f46e5_60%,#2563eb)] px-6 max-sm:px-4 pb-5 pt-5 max-sm:pb-3 max-sm:pt-3 text-white">
      <div className="flex items-start gap-4 max-sm:gap-2.5">
        <Avatar employee={emp} className="!h-14 !w-14 !text-base ring-4 ring-white/25 max-sm:!h-10 max-sm:!w-10 max-sm:!text-sm max-sm:ring-2" />
        <div className="min-w-0 flex-1 pt-1 max-sm:pt-0">
          <h2 id={`emp-${emp.id}-title`} className="truncate text-xl font-bold leading-tight max-sm:whitespace-normal max-sm:break-words max-sm:text-[15px] max-sm:[text-overflow:clip]">{emp.full_name}</h2>
          <p className="truncate text-[13px] text-white/70">{emp.position ?? "Usta"}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 max-sm:h-7 max-sm:w-7 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5 max-sm:mt-2.5 max-sm:gap-1.5">
        {([["Alət", `${toolsN} ədəd`], ["Material", `${matsN} növ`], ["«Aldım» gözləyir", String(waiting)]] as const).map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white/12 px-3.5 py-2.5 backdrop-blur-sm max-sm:rounded-xl max-sm:px-2 max-sm:py-1.5">
            <p className="text-[11px] max-sm:text-[10px] font-semibold text-white/65">{l.startsWith("«") ? <><span className="max-sm:hidden">{l}</span><span className="sm:hidden">Gözləyir</span></> : l}</p>
            <p className="text-lg max-sm:text-sm font-extrabold tabular-nums max-sm:whitespace-nowrap">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
