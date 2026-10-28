import { useState } from "react";
import { decideRequest } from "@/services/depot/documents";
import { depotFileUrl } from "@/services/depot/files";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { RequestRowProps } from "@/types/depot";
import { REQUEST_TYPES } from "../constants/requests";
import { giveable } from "../utils/giveable";
import { fmt, parseQty } from "../utils/quantity";
import { needsOtherApprover, requestLabel } from "../utils/requests";
import { useLoggedUse } from "./useLoggedUse";

// Gözləyən sənədin vəziyyəti və əməliyyatları: qəbul (lazım olsa düzəldilmiş miqdarla), rədd, ləğv, faylı aç
export function useRequestDecision({ r, holding, tool, myUid, owner }: RequestRowProps) {
  const t = { ...REQUEST_TYPES[r.type], label: requestLabel(r) };
  const material = r.tool_kind === "material";
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [qty, setQty] = useState(fmt(r.quantity ?? 0));
  const [used, setUsed] = useState(fmt(r.used ?? 0));
  const [ret, setRet] = useState(fmt(r.returned ?? 0));
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const materialReturn = r.type === "return" && material;
  const logged = useLoggedUse(r.employee_id, r.tool_id, holding?.taken_at ?? null, materialReturn);

  async function decide(approve: boolean) {
    setPending(true);
    const fix = !approve || !editing ? { note } : materialReturn
      ? { used: parseQty(used), returned: parseQty(ret), note }
      : { quantity: parseQty(qty), note };
    const res = await decideRequest(r.id, approve, fix);
    setPending(false);
    if (res?.error) return toast.error(res.error);
    toast.success(approve ? `${t.label} qəbul edildi` : `${t.label} rədd edildi`);
  }

  async function cancel() {
    const { error } = await createClient().rpc("depot_request_cancel", { p_id: r.id });
    if (error) return toast.error(error.message);
    toast.success("Sənəd ləğv edildi");
    revalidate();
  }

  async function openFile() {
    if (!r.photo_path) return;
    const url = await depotFileUrl(r.photo_path);
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("Fayl açılmadı.");
  }

  return {
    t, u: material ? r.unit : "ədəd", blocked: needsOtherApprover(r, myUid, owner), mine: r.created_by === myUid,
    // Düzəliş yalnız miqdarı olan sənədlərdə (sayımda sayılan dəyişmir: yenidən sayılsın)
    editable: r.type !== "count", materialReturn, logged, can: giveable(r, tool),
    who: r.type === "return" || r.type === "request" ? r.created_by_name : `yazdı: ${r.created_by_name ?? "—"}`,
    editing, setEditing, rejecting, setRejecting, qty, setQty, used, setUsed, ret, setRet, note, setNote, pending,
    decide, cancel, openFile,
  };
}
