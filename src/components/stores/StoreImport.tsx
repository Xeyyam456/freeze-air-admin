
import { useState, useTransition } from "react";
import { readSheet } from "read-excel-file/browser";
import { Download, Upload } from "lucide-react";
import { parseCoordinates } from "@/lib/navigation";
import { importStores, type StoreInput } from "@/actions/stores";
import { toast } from "@/lib/toast";
import { KIND, type Kind } from "@/lib/kinds";

type ParsedRow = StoreInput & { line: number; error?: string };

// Başlıqları sadələşdir: "Ünvan" → "unvan", "Kod " → "kod"
function normalize(h: unknown) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/ü/g, "u").replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

const COLUMNS: Record<string, string[]> = {
  code: ["kod", "code"],
  name: ["ad", "name", "magaza"],
  address: ["unvan", "address"],
  coords: ["koordinat", "coords", "coordinates"],
  lat: ["enlik", "lat", "latitude"],
  lng: ["uzunluq", "lng", "lon", "longitude"],
  phone: ["telefon", "phone", "tel"],
};

function cell(v: unknown) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function parseRows(data: unknown[][]): ParsedRow[] | string {
  const header = (data[0] ?? []).map(normalize);
  const index: Record<string, number> = {};
  for (const [key, names] of Object.entries(COLUMNS)) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) index[key] = i;
  }
  if (index.code == null || index.name == null) {
    return "Birinci sətirdə ən azı \"Kod\" və \"Ad\" sütunları olmalıdır.";
  }

  return data.slice(1)
    .map((r, i) => {
      const get = (k: string) => (index[k] != null ? cell(r[index[k]]) : null);
      const row: ParsedRow = {
        line: i + 2,
        code: get("code") ?? "",
        name: get("name") ?? "",
        address: get("address"),
        phone: get("phone"),
        lat: null,
        lng: null,
      };

      const coordsText = get("coords");
      const latText = get("lat");
      const lngText = get("lng");
      const coords = coordsText
        ? parseCoordinates(coordsText)
        : latText && lngText ? parseCoordinates(`${latText}, ${lngText}`) : null;
      if ((coordsText || latText || lngText) && !coords) row.error = "Koordinat səhvdir";
      row.lat = coords?.lat ?? null;
      row.lng = coords?.lng ?? null;

      if (!row.code || !row.name) row.error = "Kod və ya ad boşdur";
      return row;
    })
    .filter((r) => r.code || r.name || r.address);
}

export function StoreImport({ companyId, kind }: { companyId: number; kind: Kind }) {
  const [rows, setRows] = useState<ParsedRow[]>([]);

  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    setRows([]);
    if (!file) return;
    try {
      const result = parseRows(await readSheet(file));
      if (typeof result === "string") toast.error(result);
      else setRows(result);
    } catch {
      toast.error("Fayl oxunmadı. .xlsx formatında Excel faylı seçin.");
    }
  }

  const valid = rows.filter((r) => !r.error);
  const invalid = rows.length - valid.length;

  function upload() {
    startTransition(async () => {
      const res = await importStores(companyId, valid.map((r) => ({
        code: r.code, name: r.name, address: r.address, phone: r.phone, lat: r.lat, lng: r.lng,
      })));
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${valid.length} ${KIND[kind].unit} yükləndi`);
        setRows([]);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="muted text-xs">
        Sütunlar: <b>Kod</b>, <b>Ad</b>, Ünvan, Koordinat, Telefon. Eyni kodlu {KIND[kind].unit} varsa, yenilənir.
        Kod sütununu Excel-də &quot;Mətn&quot; formatında saxla ki, 015-dəki sıfır itməsin.
      </p>
      <a href="/magaza-sablon.xlsx" download className="btn btn-soft btn-sm w-full">
        <Download size={14} /> Şablonu yüklə
      </a>

      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-4 py-4 text-center hover:border-primary hover:bg-primary-soft/40">
        <Upload size={20} className="text-primary" />
        <span className="text-sm font-semibold">.xlsx faylını seç</span>
        <input type="file" accept=".xlsx" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
      </label>

      {rows.length > 0 && (
        <>
          <p className="text-sm font-medium">
            {valid.length} düzgün sətir
            {invalid > 0 && <span className="text-danger"> · {invalid} səhvli (yüklənməyəcək)</span>}
          </p>
          <div className="table-wrap max-h-28">
            <table>
              <thead>
                <tr><th>Sətir</th><th>Kod</th><th>Ad</th><th>Vəziyyət</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={r.error ? "bg-danger-soft" : ""}>
                    <td>{r.line}</td>
                    <td>{r.code}</td>
                    <td>{r.name}</td>
                    <td className={r.error ? "font-medium text-danger" : "text-ok"}>{r.error ?? "Hazırdır"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={upload} disabled={pending || valid.length === 0} className="btn btn-primary w-full">
            {pending ? "Yüklənir..." : `${valid.length} ${KIND[kind].unitAcc} yüklə`}
          </button>
        </>
      )}
    </div>
  );
}
