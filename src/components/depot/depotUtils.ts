import type { Tables } from "@/lib/database.types";

// Depo bölməsinin ortaq tipləri və köməkçiləri (DepotForms, DepotDocs, Approvals, DepotExtras işlədir)

export type Tool = Tables<"tool_stock">;
// Depoda iki növ var: alət və material (mis boru, qaz balonu...). Eyni cədvəl, eyni qaydalar; material ölçü vahidi ilə (metr, kq...).
export type Kind = "tool" | "material";
// Ustada hazırda olan alət/material (açıq təhvil). received_at: usta "Aldım" basıb; disputed_at: "Almadım" deyib (0084)
export type Holding = {
  id: number;
  tool_id: number;
  employee_id: number;
  quantity: number;
  taken_at: string;
  received_at: string | null;
  disputed_at: string | null;
  employees: { full_name: string; photo_url: string | null } | null;
};
// Depoda qalan material parçası (usta işlədib, qalanını təhvil verib): ayrı-ayrı göstərilir
// length: depoda qalan uzunluq; original_length: usta ilkin nə qədər qaytarıb (parçadan hissə veriləndə length azalır, original qalır)
export type Piece = { id: number; tool_id: number; length: number; original_length: number | null; created_at: string; employees: { full_name: string } | null };
export type DepotEmployee = Pick<Tables<"employees">, "id" | "full_name" | "photo_url" | "position" | "is_management" | "is_storekeeper" | "user_id">;
// Təsdiq gözləyən sənəd (mədaxil, qaytarma, silinmə, sayım, istək)
export type DepotRequest = Tables<"depot_requests">;
export type Repair = Tables<"tool_repairs">;

// Hər növün mətnləri
export const TEXT: Record<Kind, {
  tab: string; col: string; newTitle: string; addLabel: string; added: string; editTitle: string; deleteTitle: string;
  qty: string; placeholder: string; search: string; empty: string; hint: string; peopleCol: string; word: string;
}> = {
  tool: {
    tab: "Alətlər", col: "Alət", newTitle: "Yeni alət", addLabel: "Aləti əlavə et", added: "Alət əlavə edildi", editTitle: "Aləti redaktə et",
    deleteTitle: "Aləti sil", qty: "Say", placeholder: "Vakuum nasos", search: "Alət və ya usta axtar...",
    empty: "Hələ alət yoxdur", hint: "Üzərindəki alətlər", peopleCol: "Ədəd", word: "alət",
  },
  material: {
    tab: "Materiallar", col: "Material", newTitle: "Yeni material", addLabel: "Materialı əlavə et", added: "Material əlavə edildi", editTitle: "Materialı redaktə et",
    deleteTitle: "Materialı sil", qty: "Miqdar", placeholder: "Mis boru 3/8", search: "Material və ya usta axtar...",
    empty: "Hələ material yoxdur", hint: "Üzərindəki materiallar", peopleCol: "Növ", word: "material",
  },
};
export const UNITS = ["ədəd", "metr", "kq", "litr", "rulon", "bağlama"];

// Miqdar kəsr ola bilər (0085: 1 balon = 11,3 kq); alət həmişə tam ədəddir. 2 rəqəmə yuvarlanır (11,3 × 2 = 22,6, 22,6000001 yox).
export const round2 = (n: number) => Math.round(n * 100) / 100;
// Göstəriş: "11,3" (vergüllə)
export const fmt = (n: number) => String(round2(n)).replace(".", ",");
// Yazılan mətn → ədəd: "11,3" və "11.3" ikisi də olur; boş → NaN
export const parseQty = (s: string) => (s.trim() === "" ? NaN : Number(s.trim().replace(",", ".")));

// Qablı materialda (balon...) tam qabların sayı mötərizədə: "22,6 kq (2 balon)"
export type PackInfo = { pack_name: string | null; pack_size: number | null };
export const isPacked = (p: PackInfo | null | undefined): p is { pack_name: string; pack_size: number } => !!p?.pack_name && !!p?.pack_size;
export const packSuffix = (n: number, p: PackInfo) => {
  if (!isPacked(p) || n <= 0) return "";
  const count = round2(n / p.pack_size);
  return Number.isInteger(count) ? ` (${count} ${p.pack_name})` : "";
};
// "12 metr" / "22,6 kq (2 balon)" (material) | "12" (alət)
export const withUnit = (n: number, t: Pick<Tool, "kind" | "unit" | "pack_name" | "pack_size">) => (t.kind === "material" ? `${fmt(n)} ${t.unit}${packSuffix(n, t)}` : fmt(n));
// Ustada olan miqdar: "11,3 kq (1 balon)"
export const showQty = (n: number, unit: string, p?: PackInfo | null) => `${fmt(n)} ${unit}${p ? packSuffix(n, p) : ""}`;
// Depoya qayıdan qalıq: qablıda "açıq balon", boruda "parça"
export const pieceWord = (p: PackInfo | null | undefined) => (isPacked(p) ? (p.pack_name === "ədəd" ? "açıq qab" : `açıq ${p.pack_name}`) : "parça");
// Alətdə "ədəd", materialda ölçü vahidi
export const unitOf = (t: Pick<Tool, "kind" | "unit">) => (t.kind === "material" ? t.unit : "ədəd");
// Boru (metr): bu qədər və ya az qaytarılan hissə parça olur, çoxu tam boruya qatılır (bazada settle_material ilə eyni hədd)
export const PIECE_MAX = 3;

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın.
export function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Ustada nə qədərdir: bu qədər gündən çox qalan alət xəbərdarlıq rəngində göstərilir
export const STALE_DAYS = 14;
// max(0): kompüterin saatı bazadan bir neçə saniyə geri qalanda yeni götürülən "-1 gün" göstərməsin
export const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
export const dateAz = (iso: string) => iso.slice(0, 10).split("-").reverse().join(".");
export const timeAz = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Depoda minimum qalıq həddinə çatıb: depodakı tam say (materialda + parçalar) həddə bərabər və ya ondan azdır
export function isLowStock(t: { min_stock: number | null; available: number; pieces_total: number }) {
  return t.min_stock != null && t.available + t.pieces_total <= t.min_stock;
}

// Sənəd növləri: başlıq, nişan rəngi
export const REQUEST_TYPES: Record<string, { label: string; tone: string }> = {
  receipt: { label: "Mədaxil", tone: "bg-ok-soft text-ok" },
  return: { label: "Qaytarma", tone: "bg-primary-soft text-primary" },
  writeoff: { label: "Silinmə aktı", tone: "bg-danger-soft text-danger" },
  count: { label: "Sayım", tone: "bg-[#f1ebff] text-[#6d28d9]" },
  request: { label: "İstək", tone: "bg-[#fff4e0] text-[#b45309]" },
};
// Təsdiqlənmiş silinmə (itki): siyahıda "1 xarab olub", hamısı gedibsə vəziyyət "Xarab olub"
export type Loss = Pick<DepotRequest, "tool_id" | "quantity" | "reason" | "note" | "decided_at">;
// "1 ədəd xarab olub · 1 ədəd itib" (eyni səbəblər toplanır)
export function lossText(list: Loss[], unit: string) {
  const by = new Map<string, number>();
  for (const l of list) by.set(l.reason ?? "other", (by.get(l.reason ?? "other") ?? 0) + (l.quantity ?? 0));
  return [...by].map(([r, n]) => `${fmt(n)} ${unit} ${(REASONS[r] ?? r).toLocaleLowerCase("az")}`).join(" · ");
}
// Sənədin adı: ustanın istəyi materialdırsa "Material istəyi", alətdirsə "Alət istəyi" (istifadəçi: material istəyi "alət istəyi" görünürdü)
export const requestLabel = (r: Pick<DepotRequest, "type" | "tool_kind">) =>
  r.type === "request" ? (r.tool_kind === "material" ? "Material istəyi" : "Alət istəyi") : REQUEST_TYPES[r.type]?.label ?? r.type;
export const REASONS: Record<string, string> = {
  broken: "Xarab olub",
  lost: "İtib",
  stolen: "Oğurlanıb",
  used: "Sərf olunub",
  other: "Başqa səbəb",
};
// Yazan öz sənədini təsdiqləyə bilməz (müdirdən başqa; bazada depot_decide eyni qaydanı yoxlayır)
export const needsOtherApprover = (r: Pick<DepotRequest, "type" | "created_by">, myUid: string | null, owner: boolean) =>
  ["receipt", "writeoff", "count"].includes(r.type) && r.created_by === myUid && !owner;
