// Yanacaq növünün adı; seçilməyibsə empty
export function fuelLabel(type: string | null, empty: string) {
  return type === "diesel" ? "Dizel" : type === "petrol" ? "Benzin" : empty;
}
