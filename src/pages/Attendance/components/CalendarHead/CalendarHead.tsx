import { FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/shared/components/Button";
import type { CalendarHeadProps } from "@/types/attendance";
import { exportAttendanceEmployee } from "../../utils/excel/exportEmployee";

// Təqvim pəncərəsinin başlığı: ad, Excel, bağla
export function CalendarHead({ month, name, employeeId, onClose }: CalendarHeadProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id="att-cal-title" className="text-lg font-bold">Davamiyyət təqvimi</h2>
        <p className="muted truncate text-sm">{name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="soft" size="sm" onClick={() => void exportAttendanceEmployee(month, { id: employeeId, full_name: name })} title="Bu ayı Excel fayla çıxar">
          <FileSpreadsheet size={15} className="text-ok" /> Excel
        </Button>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
    </div>
  );
}
