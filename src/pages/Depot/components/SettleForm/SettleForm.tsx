import { ActionForm } from "@/components/forms";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import type { SettleFormProps } from "@/types/depot";
import { isPacked, round2, fmt } from "../../utils/quantity";
import { MiniSeg } from "../MiniSeg";

// Materialın təhvili: usta nə qədər qaytarır (kq | balon) və qalanı işlədib, ya da ustada qalır
export function SettleForm({ r }: SettleFormProps) {
  const { unit, pack, invalid, empty, pending, logged, usedBase, hint } = r;
  return (
    <ActionForm action={r.action} className="mt-2 rounded-xl bg-bg p-3 max-sm:p-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 max-sm:flex-col max-sm:items-stretch max-sm:gap-y-1.5">
        <label className="flex items-center gap-2 max-sm:gap-1.5">
          <span className="text-sm font-semibold max-sm:w-14 max-sm:shrink-0 max-sm:text-xs">Qaytarır</span>
          <Input value={r.retText} onChange={(e) => r.setRetText(e.target.value)} inputMode="decimal" placeholder="0" autoFocus autoComplete="off"
            aria-invalid={invalid} className={`!h-8 !w-20 !px-2 !text-[13px] max-sm:!h-7 max-sm:!w-12 max-sm:!text-xs ${invalid ? "!border-danger" : ""}`} />
          {isPacked(pack) ? (
            <MiniSeg value={r.byPack} onChange={r.setByPack} items={[[false, unit], [true, pack.pack_name]]} label="Vahid" />
          ) : (
            <span className="muted text-sm">{unit}</span>
          )}
        </label>
        <span className="flex items-center gap-2 max-sm:gap-1.5">
          <span className="text-sm font-semibold max-sm:w-14 max-sm:shrink-0 max-sm:text-xs">Qalanı</span>
          <MiniSeg value={r.restUsed} onChange={r.setRestUsed} items={[[true, "işlədib"], [false, "ustada qalır"]]} label="Qalanı" />
        </span>
      </div>
      {/* Usta iş qeydlərində nə qədər işlətdiyini yazıb: müqayisə üçün */}
      {logged !== null && logged > 0 && (
        <p className={`mt-2 text-xs font-semibold ${round2(logged) === usedBase ? "text-ok" : "text-[#b45309]"}`}>İş qeydlərində: {fmt(logged)} {unit}</p>
      )}
      <div className="mt-3 flex items-center gap-2 max-sm:mt-2 max-sm:gap-1.5">
        <p className={`min-w-0 flex-1 text-xs max-sm:text-[11px] ${invalid ? "font-semibold text-danger" : "muted"}`}>{hint}</p>
        <Button type="submit" size="sm" disabled={pending || invalid || empty} className="!h-8 max-sm:!h-7 max-sm:!px-2.5 max-sm:!text-xs">{pending ? "..." : "Təhvil al"}</Button>
        <Button variant="cancel" size="sm" onClick={r.resetForm} className="!h-8 max-sm:!h-7 max-sm:!px-2.5 max-sm:!text-xs">Ləğv</Button>
      </div>
    </ActionForm>
  );
}
