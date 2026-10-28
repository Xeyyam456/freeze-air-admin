// 100 sətir qaydası (CSS və avtomatik tiplər xaric). Köhnə uzun fayllar lines-baseline.json-dadır:
// onlar bölünənə qədər icazəlidir, amma böyüyə bilməz. Yeni fayl 100-ü keçə bilməz.
// npm run check:lines            → pozuntu varsa xəta (pre-commit bunu işlədir)
// npm run check:lines -- --list  → bütün uzun faylları göstər
// npm run check:lines -- --update-baseline → fayl bölünəndən sonra siyahını kiçilt
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const LIMIT = 100;
const ROOT = "src";
const BASELINE = "scripts/lines-baseline.json";
const CODE = /\.(ts|tsx|mjs|js)$/;
const SKIP = ["vite-env.d.ts", "next-env.d.ts"];
const args = process.argv.slice(2);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (CODE.test(name)) out.push(path);
  }
  return out;
}

const rel = (p) => relative(ROOT, p).replaceAll("\\", "/");
const files = walk(ROOT).map(rel).filter((p) => !SKIP.some((s) => p.startsWith(s)));
const count = (p) => readFileSync(join(ROOT, p), "utf8").trimEnd().split("\n").length;
const long = Object.fromEntries(files.map((p) => [p, count(p)]).filter(([, n]) => n > LIMIT));

if (args.includes("--update-baseline")) {
  const old = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : null;
  const next = {};
  for (const [p, n] of Object.entries(long)) if (!old || (old[p] && n <= old[p])) next[p] = n;
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(BASELINE, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Baseline: ${Object.keys(sorted).length} fayl.`);
  process.exit(0);
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
if (args.includes("--list")) {
  for (const [p, n] of Object.entries(long).sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${p}`);
}

const errors = [];
for (const [p, n] of Object.entries(long)) {
  if (!(p in baseline)) errors.push(`YENİ ${n} sətir (max ${LIMIT}): ${p}`);
  else if (n > baseline[p]) errors.push(`BÖYÜYÜB ${baseline[p]} → ${n} sətir (böl, böyütmə): ${p}`);
}
const done = Object.keys(baseline).filter((p) => !(p in long));
console.log(`${files.length} kod faylı · köhnə uzun fayl: ${Object.keys(long).length - errors.length}`);
if (done.length) console.log(`Bölünüb (baseline-dan sil: --update-baseline): ${done.join(", ")}`);
for (const e of errors) console.error("  ✗ " + e);
process.exitCode = errors.length ? 1 : 0;
