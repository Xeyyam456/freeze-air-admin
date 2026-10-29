import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { insertPayment, removePayment } from "@/services/fuel/payments";
import { fillMissing, updatePer100, updatePrice } from "@/services/fuel/settings";
import type { FuelType } from "@/types/fuel";
import { FUEL_TYPES } from "../shared/fuelTypes";
import { azn } from "../shared/money";

export async function savePrice(kind: FuelType, price: number | null) {
  const error = await updatePrice(kind, price);
  if (error) return toast.error(error), false;
  await fillMissing();
  toast.success(`${FUEL_TYPES[kind]} qiyməti yeniləndi`, "Yeni günlər bu qiymətlə hesablanır, köhnələr dəyişmir");
  revalidate();
  return true;
}

export async function savePer100(id: number, v: number | null) {
  const error = await updatePer100(id, v);
  if (error) return toast.error(error), false;
  await fillMissing();
  toast.success("100 km-ə sərf yeniləndi");
  revalidate();
  return true;
}

export async function addPayment(employeeId: number, day: string, amount: number, note: string | null) {
  const error = await insertPayment(employeeId, day, amount, note);
  if (error) return toast.error(error), false;
  toast.success(`${azn(amount)} verildi`, "Usta «Aldım» ilə təsdiqləyəcək");
  revalidate();
  return true;
}

// ConfirmButton xətanı özü göstərir
export async function deletePayment(id: number) {
  const error = await removePayment(id);
  if (error) throw new Error(error);
  toast.success("Ödəniş silindi");
  revalidate();
}
