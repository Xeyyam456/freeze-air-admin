// Ünvan üçün addan latın hərfli qısa ad: "Ev və mənzil" → "ev-ve-menzil"
export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
