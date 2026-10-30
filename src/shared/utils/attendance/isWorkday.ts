export function isWorkday(iso: string) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay() !== 0; // 0 = bazar
}
