import type { Tables } from "@/types/database";

export type ToolBrief = Pick<Tables<"tools">, "name" | "kind" | "unit">;
