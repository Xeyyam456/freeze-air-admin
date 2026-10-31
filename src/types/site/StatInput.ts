import type { SiteStat } from "./SiteStat";

// Ana səhifənin inam hissələri: rəqəmlər zolağı və tez-tez verilən suallar
export type StatInput = Omit<SiteStat, "id">;
