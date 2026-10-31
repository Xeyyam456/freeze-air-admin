import { Download, Upload } from "lucide-react";
import { KIND } from "@/lib/kinds";
import type { StoreScopeProps } from "@/types/clients";
import { useStoreImport } from "../../hooks/useStoreImport";
import { ImportPreview } from "./ImportPreview";
import { Button } from "@/shared/components/Button";

// Excel-dən toplu filial/mağaza yükləmə
export function StoreImport(props: StoreScopeProps) {
  const k = KIND[props.kind];
  const { rows, valid, invalid, pending, onFile, upload } = useStoreImport(props);

  return (
    <div className="space-y-3">
      <p className="muted text-xs">
        Sütunlar: <b>Kod</b>, <b>Ad</b>, Ünvan, Koordinat, Telefon. Eyni kodlu {k.unit} varsa, yenilənir.
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
          <ImportPreview rows={rows} />
          <Button type="button" onClick={upload} disabled={pending || valid.length === 0} className="w-full">
            {pending ? "Yüklənir..." : `${valid.length} ${k.unitAcc} yüklə`}
          </Button>
        </>
      )}
    </div>
  );
}
