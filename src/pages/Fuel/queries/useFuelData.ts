import { useData } from "@/lib/useData";
import { fetchFuel } from "@/services/fuel/fetchFuel";
import { FUEL_KEY } from "./keys";

export const useFuelData = (from: string, to: string, today: string, mFrom: string, mTo: string) =>
  useData(FUEL_KEY, () => fetchFuel(from, to, today, mFrom, mTo), [from, to, today, mFrom, mTo]);
