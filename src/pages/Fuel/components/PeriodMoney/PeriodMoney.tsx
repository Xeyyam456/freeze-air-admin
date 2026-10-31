import { HandCoins } from "lucide-react";
import type { PeriodMoneyProps } from "@/types/fuel";
import { azn, BAL_CLS } from "../../shared/money";
import { PERIOD_TOTAL } from "../../shared/period";
import { balanceText } from "../../utils/balanceText";
import { Button } from "@/shared/components/Button";

// Seçilmiş dövrün yanacaq pulu: sürülən km-ə görə
export function PeriodMoney({ sel, period, range, monthR, onPay }: PeriodMoneyProps) {
  const bal = balanceText(sel.balance);
  return (
    <div className="rounded-2xl bg-gradient-to-br from-frost/25 to-primary/25 px-5 py-4 ring-1 ring-frost/30 max-xl:px-4 max-xl:py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{PERIOD_TOTAL[period]} · {range.label}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
        <p className="text-4xl font-extrabold tabular-nums leading-tight max-xl:text-3xl">{azn(sel.total.cost)}</p>
        <p className="text-sm tabular-nums text-white/75">{sel.total.km.toLocaleString("az")} km · {sel.total.liters.toFixed(1)} L · {sel.total.days} / {range.workdays} iş günü</p>
      </div>
      {/* Ayın balansı (0080): ayda verilən − ayda sərf; gün/həftə seçilsə də ayın borcuna görə */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-3 text-sm max-xl:mt-2 max-xl:pt-2">
        <div><p className="text-[11px] text-white/55">Ayda sərf</p><p className="font-extrabold tabular-nums">{azn(sel.month.cost)}</p></div>
        <div><p className="text-[11px] text-white/55">Ayda verilən</p><p className="font-extrabold tabular-nums">{azn(sel.month.paid)}</p></div>
        <div><p className="text-[11px] text-white/55">Ayın balansı</p><p className={`font-extrabold tabular-nums ${BAL_CLS[bal.tone]}`}>{sel.balance > 0 ? "+" : ""}{azn(sel.balance)}</p></div>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className={`text-xs font-semibold ${BAL_CLS[bal.tone]}`}>{bal.text} · {monthR.label}</p>
        <Button type="button" onClick={onPay} variant="plain" size="sm" className="!bg-white !text-[#0b1324] hover:!bg-frost"><HandCoins size={14} /> Pul ver</Button>
      </div>
    </div>
  );
}
