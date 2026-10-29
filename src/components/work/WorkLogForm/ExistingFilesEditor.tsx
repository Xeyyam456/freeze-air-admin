import { FileText, X } from "lucide-react";
import type { ExistingFilesEditorProps } from "@/types/workLogs";

// Redaktədə mövcud fayllar: × ilə silinməyə işarələnir, saxlayanda silinir
export function ExistingFilesEditor({ files, removed, onToggle }: ExistingFilesEditorProps) {
  return (
    <div>
      <span className="label">Mövcud fayllar</span>
      <div className="flex flex-wrap gap-2">
        {files.map((f) => {
          const gone = removed.has(f.id);
          return (
            <div key={f.id} className={`relative ${gone ? "opacity-40" : ""}`}>
              {f.kind === "act" ? (
                <span className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold">
                  <FileText size={16} className="text-primary" /> Akt
                </span>
              ) : (
                <img src={f.url} alt="İşin şəkli" className="h-14 w-14 rounded-lg border border-line object-cover" />
              )}
              <button type="button" onClick={() => onToggle(f.id)}
                className={`absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-white shadow ${gone ? "bg-muted" : "bg-danger"}`}
                title={gone ? "Silməni ləğv et" : "Sil"} aria-label={gone ? "Silməni ləğv et" : "Faylı sil"}>
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
      {removed.size > 0 && <p className="mt-1 text-xs text-danger">{removed.size} fayl yadda saxlayanda silinəcək.</p>}
    </div>
  );
}
