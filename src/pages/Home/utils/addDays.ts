// "YYYY-MM-DD" gününə delta gün əlavə edir (mənfi də ola bilər)
export function addDays(day: string, delta: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
