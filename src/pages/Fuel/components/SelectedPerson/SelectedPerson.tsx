import { Avatar } from "@/components/employees/EmployeeForms";
import type { SelectedPersonProps } from "@/types/fuel";
import { fuelLabel } from "../../shared/fuelTypes";

// Başlıqdakı usta: şəkil, ad, nömrə, maşın, yanacaq növü, 100 km-ə sərf
export function SelectedPerson({ car }: SelectedPersonProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 max-sm:flex-wrap max-sm:gap-y-2.5">
      <Avatar employee={car} className="!h-12 !w-12 !text-sm !shadow-none ring-2 ring-white/20" />
      <div className="min-w-0 max-sm:contents">
        <p className="truncate text-lg font-extrabold max-sm:min-w-0 max-sm:flex-1">{car.full_name}</p>
        <p className="flex items-center gap-2 text-xs text-white/60 max-sm:basis-full max-sm:text-[11.5px] max-[400px]:flex-wrap max-[400px]:gap-y-0.5 min-[401px]:max-sm:whitespace-nowrap">
          <span className="plate !text-[10px]">{car.car_plate ?? "Nömrəsiz"}</span>
          {car.car_model ?? "Maşın"} · {fuelLabel(car.fuel_type) ?? "yanacaq seçilməyib"} · {car.fuel_per_100 ? `${car.fuel_per_100} L / 100 km` : "sərf yazılmayıb"}
        </p>
      </div>
    </div>
  );
}
