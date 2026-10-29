import type { Tables } from "@/types/database";

// Maşını olan aktiv usta (Yanacaq səhifəsi)
export type FuelCar = Pick<Tables<"employees">, "id" | "full_name" | "photo_url" | "car_plate" | "car_model" | "fuel_per_100" | "fuel_type">;
