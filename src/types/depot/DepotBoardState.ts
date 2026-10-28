import type { useDepotBoard } from "@/pages/Depot/hooks/useDepotBoard";

// Depo lövhəsinin hesablanmış vəziyyəti (DepotBoard → BoardHome, BoardHeader, cədvəllər)
export type DepotBoardState = ReturnType<typeof useDepotBoard>;
