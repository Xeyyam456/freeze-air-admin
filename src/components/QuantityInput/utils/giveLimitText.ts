const fmt = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");

// Ustaya vermək: depodakından çox yazılanda göstərilən mətn
// unit: alət üçün "ədəd", material üçün ölçü vahidi (metr, kq...)
export const giveLimitText = (limit: number, wanted: number, unit = "ədəd") =>
  limit === 0 ? "Depoda qalmayıb." : `Depoda cəmi ${fmt(limit)} ${unit} qalıb — ${fmt(wanted)} ${unit} vermək olmur.`;
