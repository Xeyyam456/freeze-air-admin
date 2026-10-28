// Sənəd növləri: başlıq, nişan rəngi
export const REQUEST_TYPES: Record<string, { label: string; tone: string }> = {
  receipt: { label: "Mədaxil", tone: "bg-ok-soft text-ok" },
  return: { label: "Qaytarma", tone: "bg-primary-soft text-primary" },
  writeoff: { label: "Silinmə aktı", tone: "bg-danger-soft text-danger" },
  count: { label: "Sayım", tone: "bg-[#f1ebff] text-[#6d28d9]" },
  request: { label: "İstək", tone: "bg-[#fff4e0] text-[#b45309]" },
};
// Silinmə səbəbləri
export const REASONS: Record<string, string> = {
  broken: "Xarab olub",
  lost: "İtib",
  stolen: "Oğurlanıb",
  used: "Sərf olunub",
  other: "Başqa səbəb",
};
