import type { LeaveStatusInfo } from "@/types/leaves";

export const STATUS: Record<string, LeaveStatusInfo> = {
  pending: { text: "Gözləyir", cls: "bg-primary-soft text-primary", bar: "bg-primary" },
  approved: { text: "Təsdiqləndi", cls: "bg-ok-soft text-ok", bar: "bg-ok" },
  rejected: { text: "Rədd edildi", cls: "bg-danger-soft text-danger", bar: "bg-danger" },
  cancelled: { text: "Usta ləğv etdi", cls: "bg-bg text-muted", bar: "bg-[#98a2b3]" },
};
