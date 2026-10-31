import type { EmployeeProps } from "@/types/employees";
import { fuelLabel } from "../../utils/fuelLabel";

// Maşın xanasının məzmunu: nömrə, marka, yanacaq növü və sərf
export function CarInfo({ employee }: EmployeeProps) {
  if (!employee.has_car) return <p className="muted font-semibold">Yoxdur</p>;
  return (
    <p className="font-semibold">
      <span className="plate">{employee.car_plate ?? "Nömrə yazılmayıb"}</span>
      {employee.car_model && <span className="muted ml-1.5 text-xs font-medium">{employee.car_model}</span>}
      <span className="muted block text-xs font-medium">
        {fuelLabel(employee.fuel_type, "Yanacaq seçilməyib")}{employee.fuel_per_100 && ` · ${employee.fuel_per_100} L / 100 km`}
      </span>
    </p>
  );
}
