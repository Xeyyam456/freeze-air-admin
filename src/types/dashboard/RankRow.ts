import type { Master } from "./Master";

// Reytinq sətri: tək usta və ya eyni heyətli qrup ("A + B")
export type RankRow = { id: string; members: Master[]; n: number };
