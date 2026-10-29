import type { FuelHeaderProps } from "@/types/fuel";
import { PeriodMoney } from "../PeriodMoney";
import { PeriodPicker } from "../PeriodPicker";
import { SelectedPerson } from "../SelectedPerson";
import { TodayReport } from "../TodayReport";

// Başlıq seçilmiş ustanı göstərir: həmişə BU GÜNÜN hesabatı + seçilmiş dövrün (gün / həftə / ay) yanacaq pulu ayrıca
export function FuelHeader({ sel, today, period, range, monthR, atEnd, onPeriod, onShift, onPay }: FuelHeaderProps) {
  return (
    // Tünd başlıq sürüşmədə yerində qalır (istifadəçi istəyi): üst zolağın altına yapışır, üstündəki boşluğu fon örtür; aşağı hissə sürüşür
    <div className="-mx-2 -mt-[var(--gap)] bg-bg px-2 pb-1 pt-[var(--gap)] xl:sticky xl:top-[var(--header-h)] xl:z-20">
      <section className="rounded-[18px] bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] p-5 text-white max-xl:p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {sel ? <SelectedPerson car={sel.car} /> : <p className="font-bold">Maşını olan usta yoxdur</p>}
          <PeriodPicker period={period} range={range} atEnd={atEnd} onPeriod={onPeriod} onShift={onShift} />
        </div>
        {sel && (
          <div className="mt-4 grid gap-3 max-xl:mt-3 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.35fr_1fr]">
            <TodayReport today={today} row={sel.today} />
            <PeriodMoney sel={sel} period={period} range={range} monthR={monthR} onPay={() => onPay(sel)} />
          </div>
        )}
      </section>
    </div>
  );
}
