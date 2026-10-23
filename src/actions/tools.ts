
import { createEmployeeAccount } from "@/actions/accounts";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { text, type FormState } from "@/lib/form-state";
import { toast } from "@/lib/toast";

// Depo: yazma yetkisi adminlərdə və depo məsulundadır (bazada can_manage_tools(), 0084).
// Say birbaşa dəyişmir: Mədaxil, Silinmə aktı və Sayım sənədləri təsdiqdən sonra işləyir (depot_decide).
// Say qaydaları da bazadadır: depoda olandan çox vermək, ustalardakından az say yazmaq olmur.
// Bazanın xəta mətnləri Azərbaycan dilindədir, olduğu kimi göstərilir.

// Yalnız formada olan sahələr yazılır: formada olmayan (məs. bazadakı kateqoriya, qeyd) toxunulmaz qalır.
// kind ("tool" | "material") yalnız əlavə edəndə gəlir (gizli sahə); unit (ölçü vahidi) yalnız materialda.
// Kəsr miqdar (0085): "11,3" və "11.3" ikisi də olur
const num = (v: FormDataEntryValue | string | null) => Number(String(v ?? "").trim().replace(",", ".") || 0);

function toolFields(formData: FormData) {
  const optional = Object.fromEntries(
    (["inventory_code", "category", "notes"] as const).filter((k) => formData.has(k)).map((k) => [k, text(formData, k)]),
  ) as { inventory_code?: string | null; category?: string | null; notes?: string | null };
  const kind = formData.has("kind") ? { kind: formData.get("kind") === "material" ? "material" : "tool" } : {};
  const unit = formData.has("unit") ? { unit: text(formData, "unit") ?? "ədəd" } : {};
  // Qablaşdırılmış material (balon...): say qabla yazılır, daxildə ölçü vahidi ilə saxlanır (2 balon × 11,3 kq = 22,6 kq).
  // "pack_mode" sahəsi varsa (material forması) qab yoxdursa sütunlar boşaldılır (balondan kq-a keçəndə)
  const packName = text(formData, "pack_name");
  const packSize = num(formData.get("pack_size"));
  const packed = !!packName && packSize > 0;
  const pack = packed ? { pack_name: packName, pack_size: packSize } : formData.has("pack_mode") ? { pack_name: null, pack_size: null } : {};
  // Minimum qalıq (istəyə görə): depodakı say bu həddə və ya azdırsa xəbərdarlıq; boş = xəbərdarlıq yoxdur
  const minRaw = formData.has("min_stock") ? String(formData.get("min_stock") ?? "").trim() : null;
  const minStock = minRaw === null ? {} : { min_stock: minRaw === "" ? null : num(minRaw) };
  return {
    name: text(formData, "name"),
    quantity: Math.round(num(formData.get("quantity")) * (packed ? packSize : 1) * 100) / 100,
    ...optional,
    ...kind,
    ...unit,
    ...pack,
    ...minStock,
  };
}

function checkFields(f: ReturnType<typeof toolFields>): string | null {
  if (!f.name) return "Adı vacibdir.";
  if (!Number.isFinite(f.quantity) || f.quantity < 0) return "Miqdar 0 və ya müsbət olmalıdır.";
  if ((f as { kind?: string }).kind === "tool" && !Number.isInteger(f.quantity)) return "Alətin sayı tam ədəd olmalıdır.";
  const m = (f as { min_stock?: number | null }).min_stock;
  if (m != null && (!Number.isFinite(m) || m < 0)) return "Minimum qalıq 0 və ya müsbət olmalıdır.";
  return null;
}

function toolError(error: { code: string; message: string }): FormState {
  return { error: error.code === "23505" ? "Bu inventar kodu artıq var." : error.message };
}

// Ad müqayisəsi: böyük/kiçik hərf, artıq boşluq və ı/i, ə/e, ö/o, ü/u, ç/c, ş/s, ğ/g fərqi nəzərə alınmır ("MIs Boru" = "Mis boru")
function nameKey(s: string) {
  return s.toLowerCase().replace(/ı/g, "i").replace(/ə/g, "e").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/\s+/g, " ").trim();
}

export async function addTool(_prev: FormState, formData: FormData): Promise<FormState> {
  const f = toolFields(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const supabase = createClient();
  // Eyni növdə eyni ad ikinci dəfə yaradılmır: mövcud olanı açıb miqdarı artırmaq lazımdır
  const kind = (f as { kind?: string }).kind ?? "tool";
  const { data: existing } = await supabase.from("tools").select("name").eq("kind", kind);
  const dup = (existing ?? []).find((t) => nameKey(t.name) === nameKey(f.name!));
  if (dup) return { error: `"${dup.name}" artıq var. Yenisini yaratma: onu siyahıdan seçib Mədaxil yaz.` };
  // Yeni alət 0 sayla yaranır; miqdar Mədaxil sənədi kimi yazılır və təsdiqlənəndə depoya düşür
  const { quantity, ...fields } = f;
  const { data: created, error } = await supabase.from("tools").insert({ ...fields, name: f.name!, quantity: 0 }).select("id").single();
  if (error || !created) return toolError(error ?? { code: "", message: "Əlavə olunmadı." });
  if (quantity > 0) {
    const res = await createReceipt(created.id, quantity, text(formData, "supplier"), text(formData, "note"), formData.get("file") as File | null);
    if (res?.error) return { error: `Əlavə olundu, amma mədaxil yazılmadı: ${res.error}` };
  }
  revalidate();
  return { ok: true };
}

// Redaktə: say formada yoxdur (say yalnız sənədlərlə dəyişir)
export async function updateTool(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const f = toolFields(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const fields: Partial<typeof f> = { ...f };
  delete fields.quantity;
  const { error } = await createClient().from("tools").update({ ...fields, name: f.name! }).eq("id", id);
  if (error) return toolError(error);
  revalidate();
  return { ok: true };
}

// Ustalarda olan alət silinmir (baza bloklayır): səbəbi tostla göstərilir
export async function deleteTool(id: number, kind: "tool" | "material" = "tool") {
  const { error } = await createClient().from("tools").delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success(kind === "material" ? "Material silindi" : "Alət silindi");
  revalidate();
}

// Ustaya ver: ustada bu alət varsa say artır. Forma: tool_id, employee_id, quantity.
export async function giveTool(_prev: FormState, formData: FormData): Promise<FormState> {
  const toolId = Number(formData.get("tool_id"));
  const employeeId = Number(formData.get("employee_id"));
  const quantity = num(formData.get("quantity") ?? "1");
  if (!toolId) return { error: "Alət seçilməyib." };
  if (!employeeId) return { error: "Usta seçilməyib." };
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: "Miqdar 0-dan çox olmalıdır." };

  const { error } = await createClient().rpc("give_tool", { p_tool_id: toolId, p_employee_id: employeeId, p_quantity: quantity });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Bir ustaya bir neçə alət/material birdən: hər biri ayrıca give_tool çağırışıdır (baza qaydaları hər birində işləyir).
// Biri alınmasa (məs. depoda çatmır), qalanları verilir və xəta mətni hansının alınmadığını deyir.
export async function giveTools(employeeId: number, items: { toolId: number; name: string; quantity: number }[]): Promise<FormState> {
  if (!employeeId) return { error: "Usta seçilməyib." };
  if (items.length === 0) return { error: "Heç nə seçilməyib." };
  const supabase = createClient();
  const failed: string[] = [];
  for (const it of items) {
    const { error } = await supabase.rpc("give_tool", { p_tool_id: it.toolId, p_employee_id: employeeId, p_quantity: it.quantity });
    if (error) failed.push(`${it.name}: ${error.message}`);
  }
  revalidate();
  if (failed.length) return { error: `${items.length - failed.length}/${items.length} verildi. Verilməyən: ${failed.join("; ")}` };
  return { ok: true };
}

// Ustadakı bütün alətləri geri al (materiallar yox: onlarda "nə qədər işlədi" deyilməlidir)
export async function returnAllTools(assignments: { id: number; quantity: number }[]): Promise<FormState> {
  const supabase = createClient();
  const failed: string[] = [];
  for (const a of assignments) {
    const { error } = await supabase.rpc("return_tool", { p_assignment_id: a.id, p_quantity: a.quantity });
    if (error) failed.push(error.message);
  }
  revalidate();
  if (failed.length) return { error: `${assignments.length - failed.length}/${assignments.length} geri alındı. ${failed[0]}` };
  return { ok: true };
}

// Geri al: hamısı və ya bir hissəsi. Tarixçə silinmir.
export async function returnTool(assignmentId: number, quantity: number): Promise<FormState> {
  const { error } = await createClient().rpc("return_tool", { p_assignment_id: assignmentId, p_quantity: quantity });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Material təhvili: usta neçə işlədib və neçə qaytarır; qalan hissə ustada qalır (hamısı bitirsə təhvil bağlanır). Bazada settle_material.
export async function settleMaterial(assignmentId: number, used: number, returned: number): Promise<FormState> {
  const { error } = await createClient().rpc("settle_material", { p_assignment_id: assignmentId, p_used: used, p_returned: returned });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Depodakı parçanı ustaya ver: amount verilməsə hamısı, verilsə bir hissəsi (qalan hissə depoda parça kimi qalır).
// Verilən hissə tam hissəyə qatılıb ustaya verilir; təhvildə yenidən bölünə bilər.
export async function givePiece(pieceId: number, employeeId: number, amount?: number): Promise<FormState> {
  const { error } = await createClient().rpc("give_piece", { p_piece_id: pieceId, p_employee_id: employeeId, p_amount: amount });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// ===== Sənədlər (0084): yazılır → başqası təsdiqləyir → say dəyişir =====

// Qaimə və ya xarab alətin şəkli (istəyə görə): qapalı "depot" bucket-i; şəkil brauzerdə WebP-yə (≤1600px), PDF olduğu kimi
async function uploadDepotFile(file: File | null): Promise<{ path: string | null; error?: string }> {
  if (!file || file.size === 0) return { path: null };
  const supabase = createClient();
  let body: Blob = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  let type = file.type;
  if (file.type.startsWith("image/") && file.type !== "image/heic") {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    body = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Şəkil çevrilmədi."))), "image/webp", 0.85));
    ext = "webp";
    type = "image/webp";
  }
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("depot").upload(path, body, { contentType: type });
  return error ? { path: null, error: `Fayl yüklənmədi: ${error.message}` } : { path };
}

// Sənədin faylına bir saatlıq link
export async function depotFileUrl(path: string) {
  const { data } = await createClient().storage.from("depot").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

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

export type WriteoffReason = "broken" | "lost" | "stolen" | "used" | "other";

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

// Sayım: depoda (boş, tam hissə) sayılan miqdar; yalnız fərqli olanlara sənəd yaranır. Qaytarır: neçə sənəd yarandı.
export async function createCount(items: { tool_id: number; counted: number }[], note: string | null): Promise<{ error?: string; created?: number }> {
  const { data, error } = await createClient().rpc("depot_count_create", { p_items: items, p_note: note ?? undefined });
  if (error) return { error: error.message };
  revalidate();
  return { created: data ?? 0 };
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

// Təmir: göndərilən say depoda boş sayılmır; qayıdanda düzəlibsə depoya, düzəlməyibsə silinmə aktı gözləməyə düşür
export async function sendRepair(toolId: number, quantity: number, place: string | null, note: string | null): Promise<FormState> {
  const { error } = await createClient().rpc("tool_repair_send", { p_tool_id: toolId, p_quantity: quantity, p_place: place ?? undefined, p_note: note ?? undefined });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function finishRepair(id: number, fixed: boolean): Promise<FormState> {
  const { error } = await createClient().rpc("tool_repair_finish", { p_id: id, p_fixed: fixed });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Yeni depo məsulu (yalnız admin): əməkdaş kartı + giriş hesabı bir addımda. Depo məsulu usta paneli ilə daxil olur (orada Depo bölməsi).
// Hesab açılmasa, kart qalır və kartdakı açar düyməsi ilə yenidən cəhd edilir.
export async function addStorekeeper(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "full_name");
  if (!name) return { error: "Ad və soyad vacibdir." };
  if (!text(formData, "email") || !text(formData, "password")) return { error: "E-poçt və parol vacibdir (depo məsulu bununla daxil olacaq)." };

  const { data: emp, error } = await createClient().from("employees")
    .insert({ full_name: name, phone: text(formData, "phone"), position: "Depo məsulu", is_management: false, is_storekeeper: true })
    .select("id").single();
  if (error || !emp) return { error: error?.message ?? "Əlavə olunmadı." };

  const res = await createEmployeeAccount(emp.id, null, formData);
  revalidate();
  if (res?.error) return { error: `Depo məsulu əlavə olundu, amma hesab açılmadı: ${res?.error} Kartdakı açar düyməsi ilə yenidən yoxla.` };
  return { ok: true };
}

// Depo məsulunu yalnız admin təyin edir (bazada trigger yoxlayır) (bazada trigger yoxlayır)
export async function setStorekeeper(employeeId: number, value: boolean) {
  const { error } = await createClient().from("employees").update({ is_storekeeper: value }).eq("id", employeeId);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success(value ? "Depo məsulu təyin edildi" : "Depo məsulu götürüldü");
  revalidate();
}
