// Baza xətasını istifadəçiyə başa düşülən mətnə çevirir
export function errorText(e: { code?: string; message: string }) {
  if (e.code === "23505") return "Bu ünvan / açar artıq istifadə olunur, başqasını yazın.";
  if (e.code === "23514") return "Sahələrdən biri düzgün deyil (uzunluq və ya format).";
  return e.message;
}
