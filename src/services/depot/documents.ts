import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { FormState } from "@/lib/form-state";
import type { WriteoffReason } from "@/types/depot";
import { uploadDepotFile } from "./files";

// ===== Sənədlər (0084): yazılır → başqası təsdiqləyir → say dəyişir =====

// Mədaxil: depoya gələn alət/material (haradan, qaimə). Təsdiqlənəndə say artır.
export async function createReceipt(toolId: number, quantity: number, supplier: string | null, note: string | null, file: File | null): Promise<FormState> {
  if (!toolId) return { error: "Alət/material seçilməyib." };
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: "Miqdar 0-dan çox olmalıdır." };
  const up = await uploadDepotFile(file);
  if (up.error) return { error: up.error };
  const { error } = await createClient().rpc("depot_receipt_create", {
    p_tool_id: toolId, p_quantity: quantity, p_supplier: supplier ?? undefined, p_note: note ?? undefined, p_photo: up.path ?? undefined,
  });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Silinmə aktı: depodan, parçadan (pieceId) və ya ustadakından (assignmentId). Təsdiqlənəndə say azalır.
export async function createWriteoff(args: {
  toolId: number; quantity: number; reason: WriteoffReason; note: string | null; file: File | null; assignmentId?: number | null; pieceId?: number | null;
}): Promise<FormState> {
  if (!Number.isFinite(args.quantity) || args.quantity <= 0) return { error: "Miqdar 0-dan çox olmalıdır." };
  if (args.reason === "other" && !args.note?.trim()) return { error: "\"Başqa səbəb\" seçiləndə izah yaz." };
  const up = await uploadDepotFile(args.file);
  if (up.error) return { error: up.error };
  const { error } = await createClient().rpc("depot_writeoff_create", {
    p_tool_id: args.toolId, p_quantity: args.quantity, p_reason: args.reason, p_note: args.note ?? undefined, p_photo: up.path ?? undefined,
    p_assignment_id: args.assignmentId ?? undefined, p_piece_id: args.pieceId ?? undefined,
  });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Təsdiq / rədd: qəbul edən faktiki miqdarı düzəldə bilər (qaytarmada az gəlib və s.)
export async function decideRequest(id: number, approve: boolean, fix: { quantity?: number; used?: number; returned?: number; note?: string | null } = {}): Promise<FormState> {
  const { error } = await createClient().rpc("depot_decide", {
    p_id: id, p_approve: approve, p_quantity: fix.quantity, p_used: fix.used, p_returned: fix.returned, p_note: fix.note ?? undefined,
  });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
