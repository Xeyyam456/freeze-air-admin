import { Download, Upload } from "lucide-react";
import { useCodeImport } from "../../hooks/useCodeImport";
import { downloadTemplate } from "../../utils/downloadTemplate";
import { CodeImportPreview } from "./CodeImportPreview";
import { Button } from "@/shared/components/Button";

// Tab: Excel-dən toplu yükləmə
export function ExcelTab() {
  const { rows, valid, invalid, newModels, pending, onFile, upload } = useCodeImport();

  return (
    <div className="space-y-3">
      <p className="muted text-xs">
        Sütunlar: <b>Model</b>, <b>Kod</b>, <b>Açıqlama</b>, <b>Edilecək iş</b>. Siyahıda olmayan model avtomatik yaranır. Eyni model və kodla xəta varsa, yenilənir.
      </p>
      <Button type="button" onClick={() => void downloadTemplate()} variant="soft" size="sm" className="w-full"><Download size={14} /> Şablonu yüklə</Button>

      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-4 py-4 text-center hover:border-primary hover:bg-primary-soft/40">
        <Upload size={20} className="text-primary" />
        <span className="text-sm font-semibold">.xlsx faylını seç</span>
        <input type="file" accept=".xlsx" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
      </label>

      {rows.length > 0 && (
        <>
          <p className="text-sm font-medium">
            {valid.length} düzgün sətir, {newModels} model
            {invalid > 0 && <span className="text-danger"> · {invalid} səhvli (yüklənməyəcək)</span>}
          </p>
          <CodeImportPreview rows={rows} />
          <Button type="button" onClick={upload} disabled={pending || valid.length === 0} className="w-full">
            {pending ? "Yüklənir..." : `${valid.length} xətanı yüklə`}
          </Button>
        </>
      )}
    </div>
  );
}
