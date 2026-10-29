import { ChevronDown } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { CarRowProps } from "@/types/fuel";
import { savePer100 } from "../../queries/mutations";
import { fuelLabel } from "../../shared/fuelTypes";
import { azn } from "../../shared/money";
import { PERIOD_LABEL } from "../../shared/period";
import { todayState } from "../../utils/todayState";
import { NumberSave } from "../NumberSave";

// Kartın xülasə sətri: usta və maşın, 100 km-ə sərf, bu günün hesabatı, dövrün məbləği; klik → başlıqda bu usta
export function CarRow({ item, period, range, expanded, onPick, onToggle }: CarRowProps) {
  const { car, total, today: t } = item;
  const s = todayState(t);
  return (
    <div className="flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 max-[391px]:relative max-sm:gap-x-3 max-sm:px-3.5" onClick={onPick}
      title="Başlıqda bu ustanı göstər">
      <div className="flex min-w-0 flex-[1_1_240px] items-center gap-3 max-[391px]:basis-full max-[391px]:pr-[76px] max-[340px]:pr-[66px]">
        <Avatar employee={car} className="!h-11 !w-11 !text-xs !shadow-none max-sm:!h-10 max-sm:!w-10" />
        <div className="min-w-0">
          <p className="truncate font-bold">{car.full_name}</p>
          <p className="muted flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs xl:flex-nowrap min-[471px]:max-sm:flex-nowrap max-sm:gap-x-1.5 max-sm:text-[11px] max-[340px]:text-[10.5px]">
            <span className="plate">{car.car_plate ?? "Nömrəsiz"}</span>
            <span className="hidden h-0 basis-full max-[391px]:block" aria-hidden="true" />
            <span className="min-w-0 truncate min-[392px]:max-[470px]:order-last min-[392px]:max-[470px]:basis-full sm:max-xl:order-last sm:max-xl:basis-full">{car.car_model ?? "Model yazılmayıb"}</span>
            {/* Növ ustanın məlumatında seçilir (Ustalar → redaktə); burada yalnız göstərilir */}
            <span className={`shrink-0 whitespace-nowrap ${fuelLabel(car.fuel_type) ? "font-semibold text-ink" : "font-semibold text-danger"}`}>· {fuelLabel(car.fuel_type) ?? "yanacaq seçilməyib"}</span>
          </p>
        </div>
      </div>
      <div className="max-[391px]:absolute max-[391px]:right-3.5 max-[391px]:top-4 max-[391px]:text-right">
        <p className="muted mb-0.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide max-[391px]:text-[9px]">100 km-ə sərf</p>
        <NumberSave key={String(car.fuel_per_100)} value={car.fuel_per_100} suffix="L" placeholder="8" compact onSave={(v) => savePer100(car.id, v)} />
      </div>
      {/* Bu günün hesabatı */}
      <div className="min-w-[170px]">
        <p className="muted mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          <span className={`h-1.5 w-1.5 rounded-full ${s.tone === "done" ? "bg-ok" : s.tone === "open" ? "bg-amber-500" : "bg-line"}`} /> Bu gün
        </p>
        <p className="flex items-baseline gap-3">
          <span className="text-lg font-extrabold tabular-nums">{t?.km ?? 0} km</span>
          <span className="text-lg font-extrabold tabular-nums text-primary">{t?.cost != null ? azn(Number(t.cost)) : "—"}</span>
          <span className="muted ml-auto min-w-0 truncate text-[10.5px] font-normal sm:hidden">{s.text}</span>
        </p>
        <p className="muted truncate text-[11px] max-sm:hidden">{s.text}</p>
      </div>
      <div className="text-right max-lg:flex max-lg:min-w-[55%] max-lg:flex-1 max-sm:basis-full max-lg:items-baseline max-lg:justify-between max-lg:gap-3 max-lg:border-t max-lg:border-line max-lg:pt-2.5">
        <p className="muted text-[11px] font-semibold uppercase tracking-wide max-sm:whitespace-nowrap max-sm:text-[10px]">{PERIOD_LABEL[period]}: {range.label}</p>
        <p className="font-extrabold tabular-nums">{azn(total.cost)}</p>
      </div>
      <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }} aria-expanded={expanded}
        className="btn btn-soft btn-sm max-sm:w-full max-sm:justify-center">
        {total.days} gün <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
