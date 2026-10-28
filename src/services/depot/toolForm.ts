import { text, type FormState } from "@/lib/form-state";

// Yalnız formada olan sahələr yazılır: formada olmayan (məs. bazadakı kateqoriya, qeyd) toxunulmaz qalır.
// kind ("tool" | "material") yalnız əlavə edəndə gəlir (gizli sahə); unit (ölçü vahidi) yalnız materialda.
// Kəsr miqdar (0085): "11,3" və "11.3" ikisi də olur
export const num = (v: FormDataEntryValue | string | null) => Number(String(v ?? "").trim().replace(",", ".") || 0);

export function toolFields(formData: FormData) {
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

export function checkFields(f: ReturnType<typeof toolFields>): string | null {
  if (!f.name) return "Adı vacibdir.";
  if (!Number.isFinite(f.quantity) || f.quantity < 0) return "Miqdar 0 və ya müsbət olmalıdır.";
  if ((f as { kind?: string }).kind === "tool" && !Number.isInteger(f.quantity)) return "Alətin sayı tam ədəd olmalıdır.";
  const m = (f as { min_stock?: number | null }).min_stock;
  if (m != null && (!Number.isFinite(m) || m < 0)) return "Minimum qalıq 0 və ya müsbət olmalıdır.";
  return null;
}

export function toolError(error: { code: string; message: string }): FormState {
  return { error: error.code === "23505" ? "Bu inventar kodu artıq var." : error.message };
}

// Ad müqayisəsi: böyük/kiçik hərf, artıq boşluq və ı/i, ə/e, ö/o, ü/u, ç/c, ş/s, ğ/g fərqi nəzərə alınmır ("MIs Boru" = "Mis boru")
export function nameKey(s: string) {
  return s.toLowerCase().replace(/ı/g, "i").replace(/ə/g, "e").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/\s+/g, " ").trim();
}
