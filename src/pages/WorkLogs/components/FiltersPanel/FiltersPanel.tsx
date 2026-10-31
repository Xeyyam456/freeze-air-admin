import { Building2, Download, Search } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import { EmployeeSelect } from "@/shared/components/EmployeeSelect";
import { ModelDropdown } from "@/shared/components/ModelDropdown";
import { LOGS_LIMIT } from "@/services/workLogs/fetchLogs";
import type { FiltersPanelProps } from "@/types/workLogs";
import { exportXlsx } from "../../utils/exportXlsx";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Card } from "@/shared/components/Card";

// Yan panel: tarix aralığı (+ hazır aralıqlar), usta, şirkət/market, axtarış, Excel-ə ixrac
export function FiltersPanel({ from, to, onFrom, onTo, onRange, filters, employeeId, onEmployee, companyId, onCompany, query, onQuery, list, tooMany }: FiltersPanelProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Search size={18} /></span>
        <h2 className="card-title">Filtrlər</h2>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted">Tarix aralığı</p>
        <div className="grid grid-cols-2 gap-2">
          <DatePicker value={from} onChange={(v) => v && onFrom(v)} small placeholder="Başlanğıc" />
          <DatePicker value={to} onChange={(v) => v && onTo(v)} small placeholder="Son" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {([["month", "Bu ay"], ["prev", "Keçən ay"], ["week", "Son 7 gün"]] as const).map(([k, label]) => (
            <Button key={k} type="button" onClick={() => onRange(k)} variant="soft" size="sm">{label}</Button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-muted">Usta</span>
        <EmployeeSelect value={employeeId ? Number(employeeId) : null} onChange={(id) => onEmployee(id ? String(id) : "")}
          employees={filters?.employees ?? []} emptyLabel="Hamısı" placeholder="Hamısı" />
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-muted">Şirkət / market</span>
        <ModelDropdown value={companyId} onChange={onCompany} all icon={Building2} placeholder="Hamısı"
          options={[{ value: "", label: "Hamısı" }, ...(filters?.companies ?? []).map((c) => ({ value: String(c.id), label: c.name, hint: c.kind === "market" ? "market" : "şirkət" }))]} />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-muted">Axtarış</span>
        <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Usta, yer və ya görülən iş..." />
      </label>

      <Button type="button" disabled={list.length === 0} onClick={() => exportXlsx(list, {
          from, to, query: query.trim(),
          employee: filters?.employees.find((e) => String(e.id) === employeeId)?.full_name ?? "hamısı",
          company: filters?.companies.find((c) => String(c.id) === companyId)?.name ?? "hamısı",
        })} className="w-full">
        <Download size={16} /> Excel-ə ixrac ({list.length})
      </Button>
      {tooMany && <p className="text-xs text-danger">Aralıqda {LOGS_LIMIT}-dən çox iş var: yalnız ən yenilər göstərilir. Aralığı daralt.</p>}
    </Card>
  );
}
