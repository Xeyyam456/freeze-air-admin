import type { Tables } from "@/types/database";

export type Announcement = Pick<Tables<"announcements">, "id" | "title" | "body" | "created_by" | "created_by_name" | "created_at">;
