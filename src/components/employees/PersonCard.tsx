import { Briefcase, Phone } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { experience } from "@/lib/experience";
import { Avatar } from "./EmployeeForms";

export type PersonStatus = { kind: "in" | "done" | "leave" | "none"; text: string };

const STATUS_TONE: Record<PersonStatus["kind"], { dot: string; pill: string }> = {
  in: { dot: "bg-ok", pill: "bg-ok-soft text-ok" },
  done: { dot: "bg-[#98a2b3]", pill: "bg-bg text-muted" },
  leave: { dot: "bg-amber-500", pill: "bg-[#fff6e5] text-amber-700" },
  none: { dot: "", pill: "bg-bg text-muted" },
};

// Profil kartı (Ustalar, Rəhbərlik): tünd zolaq (sağ küncdə düymələr), üstünə çıxan şəkil, ad, vəzifə, vəziyyət, rəqəmlər,
// altda təcrübə + zəng; klik → məlumat pəncərəsi. Web usta panelindəki PersonCard ilə eyni quruluş.
export function PersonCard({ person, subtitle, badge, highlight = false, status, stats, actions, footer, onOpen }: {
  person: Tables<"employees">;
  subtitle: React.ReactNode;
  badge?: string;
  highlight?: boolean;
  status?: PersonStatus;
  stats?: { label: string; value: number | string; tone?: string }[];
  actions?: React.ReactNode; // redaktə/sil: kliki karta keçmir
  footer?: React.ReactNode; // təcrübənin yanında əlavə sətir (məs. hesab vəziyyəti)
  onOpen: () => void;
}) {
  const exp = experience(person.start_date);
  const tone = status ? STATUS_TONE[status.kind] : null;

  return (
    <div
      className={`card flex min-w-0 cursor-pointer flex-col overflow-hidden !p-0 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-[#bfe9e3] hover:shadow-[0_16px_32px_rgba(13,148,136,0.12)] ${
        highlight ? "!border-primary ring-2 ring-primary-soft" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`${person.full_name}: məlumatlara bax`}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen()}
    >
      <div className="relative h-16 shrink-0 bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)]">
        {badge && <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">{badge}</span>}
        {actions && (
          <div className="absolute right-2 top-2 flex items-center gap-1 [&_.icon-btn]:text-white/75 [&_.icon-btn:hover]:bg-white/15 [&_.icon-btn:hover]:text-white"
            onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>

      <div className="-mt-10 flex flex-1 flex-col items-center px-5 pb-5 text-center">
        <span className="relative">
          <Avatar employee={person} className="!h-[76px] !w-[76px] !text-xl ring-4 ring-white" />
          {tone?.dot && <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full ring-[3px] ring-white ${tone.dot}`} title={status!.text} />}
        </span>
        <h3 className="mt-2 max-w-full truncate text-base font-bold">{person.full_name}</h3>
        <p className="muted max-w-full truncate text-[13px]">{subtitle}</p>
        {status && tone && <span className={`mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.pill}`}>{status.text}</span>}

        {stats && (
          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-bg px-3 py-2">
                <p className="muted text-[11px] font-semibold uppercase tracking-wide">{s.label}</p>
                <p className={`text-lg font-extrabold tabular-nums leading-tight ${s.tone ?? ""}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="min-h-4 flex-1" />
        <div className="flex w-full items-center justify-between gap-2 border-t border-dashed border-line pt-3 text-xs font-semibold">
          <span className="flex min-w-0 items-center gap-1.5" title="Təcrübə">
            <Briefcase size={14} className="shrink-0 text-primary" />
            <span className={`truncate ${exp ? "" : "muted"}`}>{exp ?? "Təcrübə yazılmayıb"}</span>
          </span>
          {person.phone ? (
            <a href={`tel:${person.phone}`} onClick={(e) => e.stopPropagation()} className="btn btn-soft btn-sm shrink-0" title={person.phone}>
              <Phone size={14} /> Zəng et
            </a>
          ) : (
            <span className="muted flex shrink-0 items-center gap-1.5"><Phone size={13} /> Telefon yoxdur</span>
          )}
        </div>
        {footer && <div className="mt-2 w-full text-left text-xs font-semibold">{footer}</div>}
      </div>
    </div>
  );
}
