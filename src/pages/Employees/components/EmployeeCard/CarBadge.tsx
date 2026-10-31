import { Car } from "lucide-react";
import type { EmployeeProps } from "@/types/employees";
import { fuelLabel } from "../../utils/fuelLabel";

// Kartın maşın sətri: nömrə + yanacaq növü nişanı
export function CarBadge({ employee }: EmployeeProps) {
  if (!employee.has_car) return <span className="muted flex items-center gap-1.5"><Car size={13} /> Maşını yoxdur</span>;
  const tone = employee.fuel_type === "diesel" ? "bg-[#fff6e5] text-amber-700" : employee.fuel_type === "petrol" ? "bg-primary-soft text-primary" : "bg-danger-soft text-danger";
  return (
    <span className="flex items-center gap-1.5" title={employee.car_model ?? "Maşın"}>
      <Car size={13} className="text-primary" />
      <span className="plate">{employee.car_plate ?? "Nömrəsiz"}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tone}`}>{fuelLabel(employee.fuel_type, "Yanacaq?")}</span>
    </span>
  );
}
