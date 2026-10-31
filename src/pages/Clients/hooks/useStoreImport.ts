import { useState, useTransition } from "react";
import { readSheet } from "read-excel-file/browser";
import { importStores } from "@/actions/stores";
import { KIND } from "@/lib/kinds";
import { toast } from "@/lib/toast";
import type { ImportRow, StoreScopeProps } from "@/types/clients";
import { parseRows } from "../utils/parseRows";

// Excel-dən filial/mağaza yükləmə: faylı oxu, düzgün/səhvli sətirləri ayır, yüklə
export function useStoreImport({ companyId, kind }: StoreScopeProps) {
  const [rows, setRows] = useState<ImportRow[]>([]);
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

  return { rows, valid, invalid: rows.length - valid.length, pending, onFile, upload };
}
