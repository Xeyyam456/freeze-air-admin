import { charRank } from "./charRank";

// Kodları kitabça sırası ilə müqayisə edir: 60, 6A, A0 ... U9, UA
export function compareCodes(a: string, b: string) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = charRank(a[i] ?? "") - charRank(b[i] ?? "");
    if (d) return d;
  }
  return 0;
}
