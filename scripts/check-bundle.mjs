// Bundle ölçüsü qoruyucusu (postbuild): limit keçilsə build uğursuz olur → Vercel deploy etmir, canlıda köhnə versiya qalır.
// Ölçülən: ilk açılışda yüklənən JS (index.html-dəki entry + modulepreload), gzip ilə; və ən böyük ayrıca chunk.
// Səbəb (2026-11-02): bölünməmiş admin 1,18 MB idi; lazy-loading pozulsa (məs. səhifəni statik import etmək) bu tutur.
// Limiti qaldırmaq lazımdırsa: əvvəl səbəbə bax (`npx vite build` çıxışı), əsaslıdırsa LIMITS-i yenilə.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const LIMITS = {
  initialGzipKB: 205, // 2026-11-02: 178 KB (react + supabase + query + Panel)
  chunkGzipKB: 55, // ən böyük lazy chunk (2026-11-02: Depo 38 KB)
};

const dist = path.resolve("dist");
const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length / 1024;

const initial = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]);
const initialKB = initial.reduce((sum, f) => sum + gz(path.join(dist, f)), 0);

const all = fs.readdirSync(path.join(dist, "assets")).filter((f) => f.endsWith(".js"));
const lazy = all.filter((f) => !initial.includes(`assets/${f}`)).map((f) => ({ f, kb: gz(path.join(dist, "assets", f)) }));
const biggest = lazy.sort((a, b) => b.kb - a.kb)[0] ?? { f: "-", kb: 0 };

const rows = [
  ["İlk yükləmə JS (gzip)", initialKB, LIMITS.initialGzipKB],
  [`Ən böyük chunk: ${biggest.f}`, biggest.kb, LIMITS.chunkGzipKB],
];
let failed = false;
for (const [name, kb, limit] of rows) {
  const ok = kb <= limit;
  if (!ok) failed = true;
  console.log(`${ok ? "✓" : "✗"} ${name}: ${kb.toFixed(1)} KB / limit ${limit} KB`);
}
if (failed) {
  console.error("Bundle limiti keçildi: ağır import və ya pozulmuş lazy-loading axtar (scripts/check-bundle.mjs).");
  process.exit(1);
}
