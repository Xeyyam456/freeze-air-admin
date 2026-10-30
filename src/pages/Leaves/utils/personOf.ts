import type { LeaveRow } from "@/types/leaves";

// Avatar üçün usta (sorğunun ustası silinibsə "?")
export const personOf = (l: LeaveRow) => ({ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null });
