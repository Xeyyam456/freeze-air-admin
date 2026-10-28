import { Input } from "@/shared/components/Input";
import type { RequestEditProps } from "@/types/depot";

// Sənədin miqdarını düzəlt (✎): material qaytarmasında işlədib + qaytarır, qalanında faktiki miqdar
export function RequestEdit({ d }: RequestEditProps) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-bg p-2.5 sm:ml-[6.25rem]">
      {d.materialReturn ? (
        <>
          <label className="flex items-center gap-1.5 text-xs font-semibold">İşlədib
            <Input inputMode="decimal" value={d.used} onChange={(e) => d.setUsed(e.target.value)} className="!h-8 !w-16 !px-2 !text-[13px]" />
          </label>
          <label className="flex items-center gap-1.5 text-xs font-semibold">Qaytarır
            <Input inputMode="decimal" value={d.ret} onChange={(e) => d.setRet(e.target.value)} className="!h-8 !w-16 !px-2 !text-[13px]" />
          </label>
        </>
      ) : (
        <label className="flex items-center gap-1.5 text-xs font-semibold">Faktiki
          <Input inputMode="decimal" value={d.qty} onChange={(e) => d.setQty(e.target.value)} className="!h-8 !w-20 !px-2 !text-[13px]" />
        </label>
      )}
      <span className="muted text-xs">{d.u} · sonra «Qəbul» bas</span>
    </div>
  );
}
