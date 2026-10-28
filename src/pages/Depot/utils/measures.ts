// Materialın necə sayıldığı: bir neçəsi birlikdə seçilir (istifadəçi: "qazı həm balon, həm kq kimi verib-alım").
// Ölçü (kq / metr / litr) daxildə saxlanılan vahiddir; Balon və ya Ədəd onunla birlikdə seçiləndə "qab" olur
// (1 balon = 11,3 kq): verəndə, alanda, mədaxildə "balon | kq" keçidi çıxır. Balon + Ədəd birlikdə: ədəd = balon sayı.
export const MEASURES = [["ədəd", "Ədəd"], ["kq", "Kq"], ["metr", "Metr"], ["litr", "Litr"], ["balon", "Balon"]] as const;
export const COUNTS = ["ədəd", "balon"]; // sayılan (qab ola bilir); qalanları ölçüdür (yalnız biri seçilir)

// Seçimdən baza vahidi və qab: { unit: "kq", pack: "balon" } | { unit: "metr", pack: null } | { unit: "balon", pack: null }
export function measureOf(sel: string[]) {
  const base = sel.find((v) => !COUNTS.includes(v)) ?? null;
  const pack = base ? (sel.includes("balon") ? "balon" : sel.includes("ədəd") ? "ədəd" : null) : null;
  return { unit: base ?? (sel.includes("balon") ? "balon" : "ədəd"), pack };
}
export const inPack = (pack: string) => (pack === "balon" ? "1 balonda" : "1 ədəddə");
