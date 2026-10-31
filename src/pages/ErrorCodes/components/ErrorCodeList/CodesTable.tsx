import type { CodesTableProps } from "@/types/errorCodes";
import { CodeRow } from "./CodeRow";

export function CodesTable({ codes, names, onEdit }: CodesTableProps) {
  return (
    <div className="card min-h-0 flex-1 overflow-y-auto !p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-[1] bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
          <tr>
            <th className="w-44 px-4 max-2xl:w-32 py-3 max-sm:hidden">Model</th>
            <th className="w-24 px-4 py-3 max-sm:w-16 max-sm:px-3">Kod</th>
            <th className="px-4 py-3">Açıqlama</th>
            <th className="px-4 py-3 max-2xl:hidden">Edilecək iş</th>
            <th className="w-20 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => <CodeRow key={c.id} code={c} modelName={names.get(c.model_id) ?? "—"} onEdit={() => onEdit(c)} />)}
        </tbody>
      </table>
      {codes.length === 0 && <p className="muted border-t border-line py-8 text-center text-sm">Heç nə tapılmadı.</p>}
    </div>
  );
}
