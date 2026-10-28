// 100 sətirdən uzun kod fayllarını göstərir (CSS və avtomatik tiplər xaric).
// İstifadə: npm run check:lines  (--all: hamısını göstər, yoxsa ilk 40)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const LIMIT = 100;
const ROOT = "src";
const CODE = /\.(ts|tsx|mjs|js)$/;
const SKIP = ["types/database/", "lib/database.types.ts", "vite-env.d.ts", "next-env.d.ts"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (CODE.test(name)) out.push(path);
  }
  return out;
}

const rel = (p) => relative(ROOT, p).replaceAll("\\", "/");
const files = walk(ROOT).filter((p) => !SKIP.some((s) => rel(p).startsWith(s) || rel(p) === s));
const long = files
  .map((p) => ({ path: rel(p), lines: readFileSync(p, "utf8").trimEnd().split("\n").length }))
  .filter((f) => f.lines > LIMIT)
  .sort((a, b) => b.lines - a.lines);

const shown = process.argv.includes("--all") ? long : long.slice(0, 40);
for (const f of shown) console.log(`${String(f.lines).padStart(5)}  ${f.path}`);
if (long.length > shown.length) console.log(`  ... daha ${long.length - shown.length} fayl (--all)`);
console.log(`\n${files.length} kod faylı, ${long.length} fayl ${LIMIT} sətirdən uzundur.`);
process.exitCode = long.length ? 1 : 0;
