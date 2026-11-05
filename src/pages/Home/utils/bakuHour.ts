// Vaxt damğasının Bakı vaxtı ilə seçilmiş günün başlanğıcından saatı (kəsr: 9.5 = 09:30).
// Başqa gündədirsə, mənfi və ya 24-dən böyük olur (müddətli hadisə günün kənarından kəsilir)
export function bakuHour(iso: string, day: string) {
  return (Date.parse(iso) - Date.parse(`${day}T00:00:00+04:00`)) / 3_600_000;
}
