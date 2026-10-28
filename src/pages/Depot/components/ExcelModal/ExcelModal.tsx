import { useState } from "react";
import { FileSpreadsheet, Users } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { ToolPicker } from "@/components/ToolPicker";
import { toast } from "@/lib/toast";
import { DHead } from "../DHead";
import { SOFT } from "../../constants/tones";
import type { ExcelModalProps } from "@/types/depot";
import { type ReportKind, exportDepot } from "../../utils/excel/exportDepot";
import { OPTIONS } from "../../constants/excelOptions";
import { Button } from "@/shared/components/Button";

// "Daha çox → Excel": hansı hesabat (və Ustalarda hansı usta) seçilir, bir düymə ilə yüklənir
export function ExcelModal({ tools, holdings, employees, onClose }: ExcelModalProps) {
  const [kind, setKind] = useState<ReportKind>("all");
  const [emp, setEmp] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const masters = employees.filter((e) => !e.is_management);

  async function run() {
    setPending(true);
    try {
      await exportDepot(kind, { tools, holdings, employees }, kind === "people" ? emp : null);
      onClose();
    } catch (e) {
      toast.error(`Excel yaradılmadı: ${(e as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="excel-title" className="!max-w-2xl">
      <DHead id="excel-title" icon={FileSpreadsheet} tone="green" title="Excel hesabatı" sub="Hansı hesabatı yükləmək istəyirsən?" onClose={onClose} />
      <div className="grid gap-2.5 max-sm:gap-1.5 sm:grid-cols-2" role="radiogroup" aria-label="Hesabat">
        {OPTIONS.map((o) => {
          const on = kind === o.id;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setKind(o.id)}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition max-sm:items-center max-sm:gap-2.5 max-sm:rounded-xl max-sm:p-2 ${on ? "border-primary bg-[#f4f8ff] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]" : "border-line hover:bg-bg"}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl max-sm:h-8 max-sm:w-8 ${SOFT[o.tone]}`}><o.icon size={18} /></span>
              <span className="min-w-0">
                <b className="block text-sm">{o.title}</b>
                <span className="muted block text-xs leading-snug max-sm:hidden">{o.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
      {kind === "people" && (
        <div className="mt-4 max-sm:mt-3">
          <span className="label">Hansı usta</span>
          <div className="flex gap-2">
            <ToolPicker items={masters.map((e) => ({ id: e.id, name: e.full_name }))} value={emp} onChange={setEmp} icon={Users}
              placeholder="Bütün ustalar" emptyLabel="Usta yoxdur" searchLabel="Usta axtar..." />
            {emp !== null && <button type="button" onClick={() => setEmp(null)} className="btn btn-cancel btn-sm !h-9 shrink-0 max-sm:!px-2.5">Hamısı</button>}
          </div>
        </div>
      )}
      <div className="mt-5 flex gap-2 max-sm:mt-4">
        <Button disabled={pending} onClick={run} className="min-w-0 flex-1"><FileSpreadsheet size={16} /> {pending ? "Hazırlanır..." : "Yüklə"}</Button>
        <Button variant="cancel" onClick={onClose} className="max-sm:min-w-0 max-sm:flex-1">Ləğv et</Button>
      </div>
    </Modal>
  );
}
