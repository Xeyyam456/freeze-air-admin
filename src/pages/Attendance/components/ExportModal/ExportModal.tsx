import { useState } from "react";
import { FileSpreadsheet, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { MONTHS_AZ } from "@/shared/utils/monthsAz";
import type { ExportModalProps } from "@/types/attendance";
import { exportAttendanceAll } from "../../utils/excel/exportAll";
import { exportAttendanceEmployee } from "../../utils/excel/exportEmployee";
import { Select } from "@/shared/components/Select";

// Excel ixracı: bütün ustalar (Xülasə + Gün-gün) və ya seçilmiş bir usta (gün-gün saatlarla); seçilmiş ay üzrə
export function ExportModal({ month, emps, onClose }: ExportModalProps) {
  const [who, setWho] = useState("all");
  const [pending, setPending] = useState(false);
  const [y, m] = month.split("-").map(Number);

  async function run() {
    setPending(true);
    try {
      const emp = emps.find((e) => String(e.id) === who);
      if (emp) await exportAttendanceEmployee(month, emp);
      else await exportAttendanceAll(month, emps);
      onClose();
    } catch {
      toast.error("Excel fayl yaradılmadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="att-export-title" className="!max-w-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="att-export-title" className="flex items-center gap-2 text-lg font-bold"><FileSpreadsheet size={18} className="text-ok" /> Davamiyyəti Excel-ə çıxar</h2>
          <p className="muted text-sm">{MONTHS_AZ[m - 1]} {y}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <label className="block">
        <span className="label">Kimin davamiyyəti</span>
        <Select value={who} onChange={(e) => setWho(e.target.value)} className="cursor-pointer">
          <option value="all">Bütün ustalar (tam siyahı)</option>
          {emps.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </Select>
      </label>
      <p className="muted mt-2 text-xs">
        {who === "all"
          ? "İki vərəq: Xülasə (hər usta bir sətir) və Gün-gün (✓ işdə, İ icazəli, X gəlmədi, B bazar)."
          : "Ayın hər günü: vəziyyət, gəlmə və getmə saatı, müddət; yuxarıda aylıq xülasə."}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="soft" onClick={onClose}>Ləğv et</Button>
        <Button variant="primary" onClick={run} disabled={pending}><FileSpreadsheet size={16} /> {pending ? "Hazırlanır..." : "Yüklə"}</Button>
      </div>
    </Modal>
  );
}
