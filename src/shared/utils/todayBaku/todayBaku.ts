// Bakı vaxtı ilə bu gün "YYYY-MM-DD"
export function todayBaku() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date());
}
