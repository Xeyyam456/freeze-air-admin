// Saytın sabit mətnlərinin siyahısı (cədvəl site_texts). Açarlar web/src/lib/site-texts.ts ilə eyni olmalıdır.
// kind: "line" bir sətir, "text" uzun mətn, "list" hər sətir bir bənd.
export type TextField = { key: string; label: string; kind?: "line" | "text" | "list" };
