import type { Tables } from "@/types/database";

export type DepotEmployee = Pick<Tables<"employees">, "id" | "full_name" | "photo_url" | "position" | "is_management" | "is_storekeeper" | "user_id">;
