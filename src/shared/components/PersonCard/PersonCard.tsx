import { Avatar } from "@/shared/components/Avatar";
import type { PersonCardProps } from "@/types/employees";
import { STATUS_TONE } from "./constants";
import { PersonBand } from "./PersonBand";
import { PersonContact } from "./PersonContact";
import { PersonStats } from "./PersonStats";

// Profil kartı (Ustalar, Rəhbərlik): tünd zolaq (sağ küncdə düymələr), üstünə çıxan şəkil, ad, vəzifə, vəziyyət, rəqəmlər,
// altda təcrübə + zəng; klik → məlumat pəncərəsi. Web usta panelindəki PersonCard ilə eyni quruluş.
export function PersonCard({ person, subtitle, badge, highlight = false, status, stats, actions, footer, onOpen }: PersonCardProps) {
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
      <PersonBand id={person.id} badge={badge} actions={actions} />

      <div className="-mt-8 flex flex-1 flex-col items-center px-4 pb-4 text-center">
        <span className="relative">
          <Avatar employee={person} className="!h-[60px] !w-[60px] !text-lg ring-4 ring-white" />
          {tone?.dot && <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full ring-[3px] ring-white ${tone.dot}`} title={status!.text} />}
        </span>
        <h3 className="mt-1.5 max-w-full truncate text-[15px] font-bold">{person.full_name}</h3>
        <p className="muted max-w-full truncate text-xs">{subtitle}</p>
        {status && tone && <span className={`mt-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone.pill}`}>{status.text}</span>}
        {stats && <PersonStats stats={stats} />}

        <div className="min-h-3 flex-1" />
        <PersonContact employee={person} />
        {footer && <div className="mt-2 w-full text-left text-xs font-semibold">{footer}</div>}
      </div>
    </div>
  );
}
