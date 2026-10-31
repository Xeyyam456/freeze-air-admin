// Supabase (PostgREST) bir sorğuda ən çox 1000 sətir qaytarır (API "Max rows"): .limit(2000) yazmaq kifayət etmir, artığı səssizcə kəsilir.
// Böyük siyahılar 1000-lik hissələrlə ardıcıl yüklənir. Sorğuda sabit sıra (məs. .order("id")) olmalıdır, yoxsa hissələr üst-üstə düşə bilər.
// Web-də eyni fayl: lib/fetchAll.ts
const PAGE = 1000;

export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  max = 20_000, // təhlükəsizlik həddi: bundan çox sətir yüklənmir
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < max; from += PAGE) {
    const { data, error } = await page(from, Math.min(from + PAGE, max) - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}
