import type { ImportPreviewProps } from "@/types/clients";

// Yüklənəcək sətirlərin önizləməsi: səhvli sətirlər qırmızı
export function ImportPreview({ rows }: ImportPreviewProps) {
  return (
    <div className="table-wrap max-h-28">
      <table>
        <thead>
          <tr><th>Sətir</th><th>Kod</th><th>Ad</th><th>Vəziyyət</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.line} className={r.error ? "bg-danger-soft" : ""}>
              <td>{r.line}</td>
              <td>{r.code}</td>
              <td>{r.name}</td>
              <td className={r.error ? "font-medium text-danger" : "text-ok"}>{r.error ?? "Hazırdır"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
