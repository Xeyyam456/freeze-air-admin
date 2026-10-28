// Yanacaq növü (0079)
export const FUEL_TYPES = { petrol: "Benzin", diesel: "Dizel" } as const;
export const FUEL_LABEL: Record<string, string> = FUEL_TYPES;
export const fuelLabel = (t: string | null) => (t && t in FUEL_TYPES ? FUEL_TYPES[t as keyof typeof FUEL_TYPES] : null);
