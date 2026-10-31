import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { deleteCompany } from "@/actions/companies";
import { ConfirmButton } from "@/components/ConfirmButton";
import { KIND } from "@/lib/kinds";
import type { ClientCardHeaderProps } from "@/types/clients";

// Vizit kartı başlığı: baş hərf, ad, növ və filial sayı; admin üçün redaktə və sil
export function ClientCardHeader({ company, kind, unitCount, admin, onEdit }: ClientCardHeaderProps) {
  const navigate = useNavigate();
  const k = KIND[kind];

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-xl font-extrabold text-white shadow-[0_6px_16px_rgba(10,126,164,0.3)]">
          {company.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight [overflow-wrap:anywhere] sm:truncate">{company.name}</h2>
          <p className="muted text-xs font-medium">
            {k.One} · {kind === "company" && unitCount === 0 ? "sabit məkan" : `${unitCount} ${k.unit}`}
          </p>
        </div>
      </div>
      {admin && (
        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} className="icon-btn" title="Redaktə et" aria-label="Redaktə et">
            <Pencil size={16} />
          </button>
          <ConfirmButton
            className="icon-btn icon-btn-danger"
            title={`${k.One}i sil`}
            question={unitCount > 0
              ? `${k.One}lə birlikdə onun ${unitCount} ${k.unit}${kind === "market" ? "sı" : "ı"} da silinəcək. Bu əməliyyatı geri qaytarmaq olmur.`
              : "Bu əməliyyatı geri qaytarmaq olmur."}
            onConfirm={async () => navigate(await deleteCompany(company.id))}
          >
            <Trash2 size={16} />
          </ConfirmButton>
        </div>
      )}
    </div>
  );
}
