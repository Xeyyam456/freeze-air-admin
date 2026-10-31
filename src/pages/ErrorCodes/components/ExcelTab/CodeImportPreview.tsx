import type { CodeImportPreviewProps } from "@/types/errorCodes";

// Yüklənəcək sətirlərin önizləməsi: səhvli sətirlər qırmızı
export function CodeImportPreview({ rows }: CodeImportPreviewProps) {
  return (
    <div className="table-wrap max-h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table>
        <thead><tr><th>Sətir</th><th>Model</th><th>Kod</th><th>Vəziyyət</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.line} className={r.error ? "bg-danger-soft" : ""}>
              <td>{r.line}</td>
              <td>{r.model}</td>
              <td>{r.code}</td>
              <td className={r.error ? "font-medium text-danger" : "text-ok"}>{r.error ?? "Hazırdır"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
