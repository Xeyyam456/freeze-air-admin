// "21.10.2026 18:41" (Bakı vaxtı)
export function stamp(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date(iso)).replace(",", "").replaceAll("/", ".");
}
