// Sənəd növləri: başlıq, nişan rəngi
export const REQUEST_TYPES: Record<string, { label: string; tone: string }> = {
  receipt: { label: "Mədaxil", tone: "bg-ok-soft text-ok" },
  return: { label: "Qaytarma", tone: "bg-primary-soft text-primary" },
  writeoff: { label: "Silinmə aktı", tone: "bg-danger-soft text-danger" },
  count: { label: "Sayım", tone: "bg-violet-500/15 text-violet-300" },
  request: { label: "İstək", tone: "bg-amber-500/15 text-amber-300" },
};
// Silinmə səbəbləri
export const REASONS: Record<string, string> = {
  broken: "Xarab olub",
  lost: "İtib",
  stolen: "Oğurlanıb",
  used: "Sərf olunub",
  other: "Başqa səbəb",
};
