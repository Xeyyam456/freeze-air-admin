import { EyeOff, ListChecks, Pencil, Route, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteService } from "@/services/site/content";
import type { ServiceCardProps } from "@/types/site";
import { SERVICE_PARTS, serviceIcon } from "../../constants/serviceIcons";

export function ServiceCard({ service: s, onEdit }: ServiceCardProps) {
  const Icon = serviceIcon(s.icon);
  const missing = SERVICE_PARTS.filter((p) => !p.done(s));
  const filled = SERVICE_PARTS.length - missing.length;
  const complete = missing.length === 0;

  return (
    <li className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_14px_36px_rgba(16,24,40,0.1)] ${s.is_active ? "" : "opacity-70"}`}>
      {/* Bütün kart redaktəni açır; içindəki düymələr üstdə qalır */}
      <button type="button" onClick={onEdit} className="absolute inset-0 z-0" aria-label={`${s.title}: redaktə et`} />

      <div className="pointer-events-none relative flex items-start gap-4 p-5 pb-4">
        <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-white shadow-[0_8px_20px_rgba(10,126,164,0.25)]">
          <Icon size={26} />
          <span className="absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full border-2 border-surface bg-ink px-1 text-[11px] font-bold text-white">{s.sort}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold">{s.title}</h3>
            {!s.is_active && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted"><EyeOff size={12} /> Gizli</span>
            )}
          </div>
          <p className="muted mt-1 line-clamp-2 text-sm">{s.text || "Qısa izah yoxdur"}</p>
        </div>
      </div>

      {/* Səhifənin dolğunluğu */}
      <div className="pointer-events-none relative mx-5 rounded-xl bg-bg p-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>Səhifə</span>
          <span className={complete ? "text-ok" : "text-primary"}>{filled}/{SERVICE_PARTS.length}{complete && " · tam"}</span>
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1">
          {SERVICE_PARTS.map((p) => (
            <span key={p.label} title={p.label} className={`h-1.5 rounded-full ${p.done(s) ? (complete ? "bg-ok" : "bg-primary") : "bg-line"}`} />
          ))}
        </div>
        {!complete && <p className="muted mt-2 truncate text-[11px]">Boş: {missing.map((p) => p.label).join(", ")}</p>}
        <div className="mt-2.5 flex gap-4 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1"><ListChecks size={13} /> {s.includes.length} bənd</span>
          <span className="flex items-center gap-1"><Route size={13} /> {s.steps.length} addım</span>
        </div>
      </div>

      <div className="relative mt-auto flex items-center gap-2 px-5 py-4">
        <span className="muted mr-auto min-w-0 truncate text-xs">/xidmet/{s.slug}</span>
        <button type="button" onClick={onEdit} className="icon-btn z-10" title="Redaktə et" aria-label="Redaktə et"><Pencil size={16} /></button>
        <ConfirmButton onConfirm={() => deleteService(s.id, s.image_url)} className="icon-btn icon-btn-danger z-10" title={`${s.title} silinsin`}>
          <Trash2 size={16} />
        </ConfirmButton>
      </div>
    </li>
  );
}
