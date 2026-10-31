import { useState } from "react";
import type { EmployeeFieldsProps, FuelKind } from "@/types/employees";
import { CarOption } from "./CarOption";
import { FuelTypeField } from "./FuelTypeField";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

// Maşın (0076): "Yoxdur / Var"; var olanda nömrə (məcburi) və marka/model (istəyə görə, gələcəkdə benzin hesabı üçün)
export function CarFields({ e }: EmployeeFieldsProps) {
  const [hasCar, setHasCar] = useState(e?.has_car ?? false);
  const [fuel, setFuel] = useState<FuelKind>(e?.fuel_type === "diesel" ? "diesel" : "petrol");
  return (
    <div className="space-y-2">
      <input type="hidden" name="car_form" value="1" />
      <input type="hidden" name="has_car" value={hasCar ? "1" : "0"} />
      <span className="label">Maşın</span>
      <div className="flex gap-1 rounded-xl bg-bg p-1">
        <CarOption on={false} hasCar={hasCar} label="Yoxdur" onPick={setHasCar} />
        <CarOption on hasCar={hasCar} label="Var" onPick={setHasCar} />
      </div>
      {hasCar && (
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Maşın nömrəsi">
            <Input name="car_plate" defaultValue={e?.car_plate ?? ""} placeholder="10-AB-123" required className="uppercase" />
          </FormField>
          <FormField label="Marka, model">
            <Input name="car_model" defaultValue={e?.car_model ?? ""} placeholder="Toyota Prius" />
          </FormField>
          <FuelTypeField value={fuel} onChange={setFuel} />
          <FormField label="100 km-ə sərf (litr)">
            <Input name="fuel_per_100" defaultValue={e?.fuel_per_100 ?? ""} inputMode="decimal" placeholder="8" />
          </FormField>
        </div>
      )}
    </div>
  );
}
