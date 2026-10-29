import type { fetchLogDetail } from "@/services/workLogs/fetchLogDetail";

// İş qeydinin ətraflısı: usta, yer, tapşırıq, materiallar, qrup üzvləri, fayllar (imzalı linklə)
export type WorkLogDetail = NonNullable<Awaited<ReturnType<typeof fetchLogDetail>>>;
