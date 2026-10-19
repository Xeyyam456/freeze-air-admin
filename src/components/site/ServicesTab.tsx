import { useState } from "react";
import { ExternalLink, EyeOff, ListChecks, Pencil, Plus, Route, Trash2 } from "lucide-react";
import { deleteService } from "@/actions/siteContent";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { ServiceEditor, serviceIcon } from "./ServiceEditor";

type Service = Tables<"site_services">;

import { SITE_URL } from "@/lib/site";

// Xidmət səhifəsinin hissələri: dolğunluq zolağı və "nə çatışmır" siyahısı üçün
const PARTS: { label: string; done: (s: Service) => boolean }[] = [
  { label: "başlıq izahı", done: (s) => !!s.lead },
  { label: "ətraflı mətn", done: (s) => !!s.details },
  { label: "nə daxildir", done: (s) => s.includes.length > 0 },
  { label: "addımlar", done: (s) => s.steps.length > 0 },
  { label: "məsləhət", done: (s) => !!s.note },
  { label: "şəkil", done: (s) => !!s.image_url },
];

// Xidmətlər: saytdakı siyahı, footer və hər xidmətin öz səhifəsi (/xidmet/<slug>)
export function ServicesTab() {
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const services = useData(async () => {
    const { data } = await createClient().from("site_services").select("*").order("sort").order("id");
    return data ?? [];
  });

  if (!services) return <div className="card muted">Yüklənir...</div>;
  const nextSort = Math.max(0, ...services.map((s) => s.sort)) + 1;

  return (
    <div className="space-y-4">
      {editing && (
        <ServiceEditor service={editing === "new" ? null : editing} nextSort={nextSort} onClose={() => setEditing(null)} />
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="muted text-sm">
          {services.length} xidmət · saytdakı siyahı, footer və hər xidmətin öz səhifəsi. Karta klik edin: redaktə açılır.
        </p>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm"><Plus size={14} /> Yeni xidmət</button>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => <ServiceCard key={s.id} service={s} onEdit={() => setEditing(s)} />)}
        <li>
          <button type="button" onClick={() => setEditing("new")}
            className="grid h-full min-h-56 w-full place-items-center rounded-2xl border-2 border-dashed border-line text-muted transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary">
            <span className="flex flex-col items-center gap-2 text-sm font-semibold"><Plus size={22} /> Yeni xidmət</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

function ServiceCard({ service: s, onEdit }: { service: Service; onEdit: () => void }) {
  const Icon = serviceIcon(s.icon);
  const missing = PARTS.filter((p) => !p.done(s));
  const filled = PARTS.length - missing.length;
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
          <span className={complete ? "text-ok" : "text-primary"}>{filled}/{PARTS.length}{complete && " · tam"}</span>
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1">
          {PARTS.map((p) => (
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
        <a href={`${SITE_URL}/xidmet/${s.slug}`} target="_blank" rel="noopener noreferrer"
          className="link z-10 mr-auto inline-flex min-w-0 items-center gap-1 truncate text-xs">
          /xidmet/{s.slug} <ExternalLink size={11} className="shrink-0" />
        </a>
        <button type="button" onClick={onEdit} className="icon-btn z-10" title="Redaktə et" aria-label="Redaktə et"><Pencil size={16} /></button>
        <ConfirmButton onConfirm={() => deleteService(s.id, s.image_url)} className="icon-btn icon-btn-danger z-10" title={`${s.title} silinsin`}>
          <Trash2 size={16} />
        </ConfirmButton>
      </div>
    </li>
  );
}
