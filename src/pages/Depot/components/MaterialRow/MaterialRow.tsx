import { Package } from "lucide-react";
import { IconTile } from "../IconTile";
import type { Tone, MaterialRowProps } from "@/types/depot";
import { fmt, isPacked, pieceWord, round2 } from "../../utils/quantity";
import { isLowStock, lossText } from "../../utils/stock";
import { REASONS } from "../../constants/requests";
import { inStock } from "../../utils/inStock";
import { StatusDot } from "../StatusDot";

// Material sətri (alətdən fərqli sütunlar): ad + ölçü çipi ("metr", "1 balon = 11,3 kq"), depoda (tam; qablıda balon sayı),
// parçalar / açıq balonlar, ustalarda, doluluq zolağı (depoda / ustalarda; minimum qalıq xətti), vəziyyət, "Ver"
export function MaterialRow({ t, losses, canManage, onOpen, onGive }: MaterialRowProps) {
  const n = inStock(t);
  const low = n > 0 && isLowStock(t);
  const out = n === 0 && t.given_out === 0;
  const st: { tone: Tone; label: string } = out ? { tone: "red", label: losses.length ? REASONS[losses[0].reason ?? "other"] ?? "Silinib" : "Qalmayıb" }
    : n === 0 ? { tone: "blue", label: "Hamısı ustada" } : low ? { tone: "amber", label: "Azalıb" } : { tone: "green", label: "Depoda var" };
  const packed = isPacked(t);
  const measure = packed ? `1 ${t.pack_name} = ${fmt(t.pack_size)} ${t.unit}` : t.unit;
  const full = packed ? Math.floor(round2(t.available / t.pack_size)) : null;
  const total = n + t.given_out;
  const pct = (v: number) => `${total ? (v / total) * 100 : 0}%`;
  return (
    <tr tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen()}
      className="group cursor-pointer border-t border-line transition-colors hover:bg-[#f5fbfa] focus-visible:outline-2 focus-visible:outline-primary">
      <td className="py-3 pl-5 pr-3 max-sm:pl-3 max-sm:pr-1">
        <span className="flex items-center gap-3">
          <span className="max-sm:hidden"><IconTile icon={Package} tone="teal" size={36} /></span>
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-semibold group-hover:text-[#0f766e] max-sm:whitespace-normal max-sm:text-[12px]">{t.name}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-[#e7f8f5] px-1.5 py-px text-[11px] font-semibold text-[#0f766e]">{measure}</span>
              {losses.length > 0 && <span className="truncate text-xs font-medium text-[#dc2626]">{lossText(losses, t.unit)}</span>}
            </span>
          </span>
        </span>
      </td>
      <td className="px-3 py-3 text-right tabular-nums max-sm:px-1 max-sm:text-center">
        <b className={`text-[16px] max-sm:text-[13px] ${t.available > 0 ? "" : "text-muted"}`}>{fmt(t.available)}</b> <span className="text-xs text-muted max-sm:text-[11px]">{t.unit}</span>
        {full !== null && full > 0 && <span className="muted block text-[11px]">{full} {t.pack_name}</span>}
      </td>
      <td className="px-3 py-3 text-right tabular-nums max-lg:hidden">
        {t.pieces_count > 0
          ? <><b>{fmt(t.pieces_total)}</b> <span className="text-xs text-muted">{t.unit}</span><span className="muted block text-[11px]">{t.pieces_count} {pieceWord(t)}</span></>
          : <span className="text-muted">—</span>}
      </td>
      <td className="px-3 py-3 text-right tabular-nums max-sm:px-1 max-sm:text-center">
        {t.given_out > 0 ? <><b className="max-sm:text-[13px]">{fmt(t.given_out)}</b> <span className="text-xs text-muted max-sm:text-[11px]">{t.unit}</span></> : <span className="text-muted">—</span>}
      </td>
      <td className="px-3 py-3 max-xl:hidden">
        <span className="relative flex h-2 w-full overflow-hidden rounded-full bg-line" title={`depoda ${fmt(n)} · ustalarda ${fmt(t.given_out)} ${t.unit}`}>
          <span className="h-full bg-[#14b8a6]" style={{ width: pct(n) }} />
          <span className="h-full bg-[#3b82f6]" style={{ width: pct(t.given_out) }} />
        </span>
        <span className="muted mt-1 block text-[11px]">{t.min_stock != null ? `min. ${fmt(t.min_stock)} ${t.unit}` : "minimum yoxdur"}</span>
      </td>
      <td className="px-3 py-3 max-md:hidden"><StatusDot tone={st.tone} label={st.label} /></td>
      <td className="py-3 pl-3 pr-5 text-right max-sm:pl-1 max-sm:pr-3">
        {canManage && t.available > 0 && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onGive(); }} className="btn btn-sm !h-8 !px-4 bg-[#0d9488] text-white hover:bg-[#0f766e] max-sm:!h-7 max-sm:!px-2.5 max-sm:!text-xs">Ver</button>
        )}
      </td>
    </tr>
  );
}
