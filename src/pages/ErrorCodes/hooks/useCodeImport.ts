import { useState, useTransition } from "react";
import { readSheet } from "read-excel-file/browser";
import { toast } from "@/lib/toast";
import { importErrorCodes } from "@/services/errorCodes/importCodes";
import type { ParsedCodeRow } from "@/types/errorCodes";
import { parseCodeRows } from "../utils/parseCodeRows";

// Excel-dən xəta kodu yükləmə: faylı oxu, düzgün/səhvli sətirləri ayır, yüklə
export function useCodeImport() {
  const [rows, setRows] = useState<ParsedCodeRow[]>([]);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    setRows([]);
    if (!file) return;
    try {
      const result = parseCodeRows(await readSheet(file));
      if (typeof result === "string") toast.error(result);
      else setRows(result);
    } catch {
      toast.error("Fayl oxunmadı. .xlsx formatında Excel faylı seçin.");
    }
  }

  const valid = rows.filter((r) => !r.error);
  const newModels = new Set(valid.map((r) => r.model.toLowerCase())).size;

  function upload() {
    startTransition(async () => {
      const res = await importErrorCodes(valid.map(({ model, code, title, solution }) => ({ model, code, title, solution })));
      if (res.error) return void toast.error(res.error);
      toast.success(`${res.added} yeni əlavə olundu${res.updated ? `, ${res.updated} yeniləndi` : ""}${res.models ? `, ${res.models} yeni model yarandı` : ""}`);
      setRows([]);
    });
  }

  return { rows, valid, invalid: rows.length - valid.length, newModels, pending, onFile, upload };
}
