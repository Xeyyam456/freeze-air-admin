// Mətn sahəsini sətirlərə böl (boşları at)
export const lines = (v: string) => v.split("\n").map((l) => l.trim()).filter(Boolean);

// Formdan kəsilmiş mətn
export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// Yeni elementin sırası: ən böyüyündən sonra
export const nextSort = (rows: { sort: number }[]) => Math.max(0, ...rows.map((r) => r.sort)) + 1;

// Ünvan və açar yoxlaması: kiçik latın hərfləri, rəqəm, tire
export const isSlug = (s: string) => /^[a-z0-9-]{1,40}$/.test(s);
