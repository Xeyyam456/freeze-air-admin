import { Package, Wrench } from "lucide-react";
import { SOFT } from "../../constants/tones";
import type { Tone, ToolRowProps } from "@/types/depot";
import { fmt, unitOf } from "../../utils/quantity";
import { isLowStock, lossText } from "../../utils/stock";
import { REASONS } from "../../constants/requests";
import { inStock } from "../../utils/inStock";
import { StatusDot } from "../StatusDot";

// Cədvəl sətri: ad (ikon), depoda, ustalarda, vəziyyət, "Ver". Sətrə basanda alətin pəncərəsi açılır.
export function ToolRow({ t, losses, canManage, onOpen, onGive }: ToolRowProps) {
  const material = t.kind === "material";
  const n = inStock(t);
  const low = n > 0 && isLowStock(t);
  // 0 olanda: hamısı ustadadırsa bu normaldır, heç yerdə yoxdursa qırmızı
  const out = n === 0 && t.given_out + t.in_repair === 0;
  // Hamısı silinibsə vəziyyət son silinmənin səbəbidir (məs. "Xarab olub")
  const st: { tone: Tone; label: string } = out ? { tone: "red", label: losses.length ? REASONS[losses[0].reason ?? "other"] ?? "Silinib" : "Qalmayıb" }
    : n === 0 ? { tone: "blue", label: "Hamısı ustada" } : low ? { tone: "amber", label: "Azalıb" } : { tone: "green", label: "Depoda var" };
  const Icon = material ? Package : Wrench;
  const u = unitOf(t);
  return (
    <tr tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen()}
      className="group cursor-pointer border-t border-line transition-colors hover:bg-[#f7f9fd] focus-visible:outline-2 focus-visible:outline-primary">
      <td className="py-2.5 pl-5 pr-3 max-sm:pl-3 max-sm:pr-1">
        <span className="flex items-center gap-3">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg max-sm:hidden ${material ? SOFT.teal : SOFT.blue}`}><Icon size={15} /></span>
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-semibold group-hover:text-primary max-sm:whitespace-normal max-sm:text-[13px]">{t.name}</span>
            {losses.length > 0 && <span className="block truncate text-xs font-medium text-[#dc2626]">{lossText(losses, unitOf(t))}</span>}
          </span>
        </span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums max-sm:px-1">
        <b className={`text-[15px] max-sm:text-[13px] ${n > 0 ? "" : "text-muted"}`}>{fmt(n)}</b> <span className="text-xs text-muted max-sm:text-[11px]">{u}</span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums max-sm:px-1">
        {t.given_out > 0 ? <><b className="text-[15px] max-sm:text-[13px]">{fmt(t.given_out)}</b> <span className="text-xs text-muted max-sm:text-[11px]">{u}</span></> : <span className="text-muted">—</span>}
      </td>
      <td className="px-3 py-2.5 max-md:hidden"><StatusDot tone={st.tone} label={st.label} /></td>
      <td className="py-2.5 pl-3 pr-5 text-right max-sm:pl-1 max-sm:pr-3">
        {canManage && t.available > 0 && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onGive(); }} className="btn btn-primary btn-sm !h-8 !px-4 max-sm:!px-3">Ver</button>
        )}
      </td>
    </tr>
  );
}
