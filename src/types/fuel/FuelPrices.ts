import type { FuelType } from "./FuelType";

// Hazırkı yanacaq qiymətləri (₼ / L)
export type FuelPrices = Record<FuelType, number | null>;
