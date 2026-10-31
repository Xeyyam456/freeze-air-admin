import { TriangleAlert } from "lucide-react";
import type { ErrorCodeListProps } from "@/types/errorCodes";
import { useErrorCodeList } from "../../hooks/useErrorCodeList";
import { EditCodeModal } from "../EditCodeModal";
import { CodeFilters } from "./CodeFilters";
import { CodesTable } from "./CodesTable";
import { Card } from "@/shared/components/Card";

// Xəta kodları siyahısı: axtarış, model süzgəci, cədvəl
export function ErrorCodeList({ codes, models }: ErrorCodeListProps) {
  const l = useErrorCodeList({ codes, models });

  return (
    <div className="flex h-full flex-col gap-4">
      {l.editing && <EditCodeModal item={l.editing} models={models} onClose={() => l.setEditing(null)} />}

      <CodeFilters codes={codes} models={models} counts={l.counts} query={l.query} onQuery={l.setQuery}
        modelFilter={l.modelFilter} onModelFilter={l.setModelFilter} />

      {codes.length === 0 ? (
        <Card className="py-14 text-center">
          <span className="icon-tile mx-auto"><TriangleAlert size={20} /></span>
          <p className="mt-3 font-semibold">Hələ xəta kodu yoxdur</p>
          <p className="muted text-sm">Əvvəl sağdan model əlavə et, sonra modeli seçib xəta kodu yaz.</p>
        </Card>
      ) : (
        <CodesTable codes={l.filtered} names={l.names} onEdit={l.setEditing} />
      )}
    </div>
  );
}
