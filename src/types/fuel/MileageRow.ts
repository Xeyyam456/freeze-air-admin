import type { Tables } from "@/types/database";

// Günün yürüşü: səhər/axşam km, şəkil, snapshot sərf və qiymət (0077)
export type MileageRow = Tables<"mileage_logs">;
