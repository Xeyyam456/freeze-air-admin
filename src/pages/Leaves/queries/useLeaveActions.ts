import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { decideLeave, removeLeaves } from "@/services/leaves/leaveActions";

// Yazma əməliyyatları: tost + keşin yenilənməsi
export function useLeaveActions() {
  async function decide(id: number, approve: boolean) {
    const error = await decideLeave(id, approve);
    if (error) return toast.error(error.message);
    toast.success(approve ? "İcazə təsdiqləndi" : "İcazə rədd edildi");
    revalidate();
  }

  async function remove(ids: number[]) {
    if (ids.length === 0) return;
    const error = await removeLeaves(ids);
    if (error) return toast.error(error.message);
    toast.success(ids.length > 1 ? `${ids.length} sorğu silindi` : "Sorğu silindi");
    revalidate();
  }

  return { decide, remove };
}
