// Vaxt damğasının Bakı vaxtı ilə günü "YYYY-MM-DD" (Bakı UTC+4, yay vaxtı yoxdur)
export function bakuDay(iso: string) {
  return new Date(Date.parse(iso) + 4 * 3_600_000).toISOString().slice(0, 10);
}
