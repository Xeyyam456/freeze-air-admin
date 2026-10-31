import { Briefcase, Crown, Phone, ShieldCheck } from "lucide-react";
import { experience } from "@/lib/experience";
import { Avatar } from "@/shared/components/Avatar";
import type { ManagerCardProps } from "@/types/management";
import { useManagerModals } from "../../hooks/useManagerModals";
import { ManagerActions } from "../ManagerActions";
import { ManagerModals } from "../ManagerModals";

// Müdirin iri tünd kartı (rəhbərliyin başı)
export function LeadCard(props: ManagerCardProps) {
  const { manager, isMe } = props;
  const m = useManagerModals();
  const exp = experience(manager.start_date);

  return (
    <>
      <ManagerModals card={props} state={m} />
      <div
        className="relative flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-4 rounded-[18px] bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] px-6 py-6 text-white transition-transform hover:-translate-y-0.5"
        role="button"
        tabIndex={0}
        aria-label={`${manager.full_name}: məlumatlara bax`}
        onClick={m.open}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && m.open()}
      >
        <Avatar employee={manager} className="!h-24 !w-24 !text-2xl ring-4 ring-white/15" />
        <div className="min-w-0 flex-[1_1_260px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-frost">
            <Crown size={12} /> {manager.position ?? "Rəhbər"}{isMe && " · Sən"}
          </span>
          <h2 className="mt-1.5 truncate text-2xl font-extrabold">{manager.full_name}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/65">
            <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-white/45" />{exp ? `Təcrübə: ${exp}` : "Təcrübə yazılmayıb"}</span>
            <span className={`flex items-center gap-1.5 ${manager.user_id ? "text-[#4ade80]" : ""}`}>
              <ShieldCheck size={14} />{manager.user_id ? "Admin hesabı var" : "Hesab açılmayıb"}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          {manager.phone ? (
            <a href={`tel:${manager.phone}`} className="btn !bg-white !text-[#0b1324] hover:!bg-frost"><Phone size={16} /> {manager.phone}</a>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-white/50"><Phone size={15} /> Telefon yazılmayıb</span>
          )}
          <ManagerActions {...props} onEdit={m.edit} onContact={m.openContact} light />
        </div>
      </div>
    </>
  );
}
