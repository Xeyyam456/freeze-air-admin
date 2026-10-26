import { X, type LucideIcon } from "lucide-react";

// Depo bölməsinin ortaq dizayn hissələri (2026-10-23, istifadəçi: "bütün modallar pro versiya, modern rənglər").
// Rəng palitrası: alət göy, material firuzəyi, usta bənövşəyi, xəbərdarlıq kəhrəba, silinmə qırmızı, depoda yaşıl.
export type Tone = "blue" | "teal" | "violet" | "amber" | "red" | "green" | "slate";

export const GRAD: Record<Tone, string> = {
  blue: "bg-[linear-gradient(135deg,#60a5fa,#2563eb)] shadow-[0_8px_18px_-6px_rgba(37,99,235,0.55)]",
  teal: "bg-[linear-gradient(135deg,#2dd4bf,#0d9488)] shadow-[0_8px_18px_-6px_rgba(13,148,136,0.55)]",
  violet: "bg-[linear-gradient(135deg,#a78bfa,#7c3aed)] shadow-[0_8px_18px_-6px_rgba(124,58,237,0.55)]",
  amber: "bg-[linear-gradient(135deg,#fbbf24,#d97706)] shadow-[0_8px_18px_-6px_rgba(217,119,6,0.55)]",
  red: "bg-[linear-gradient(135deg,#f87171,#dc2626)] shadow-[0_8px_18px_-6px_rgba(220,38,38,0.55)]",
  green: "bg-[linear-gradient(135deg,#4ade80,#16a34a)] shadow-[0_8px_18px_-6px_rgba(22,163,74,0.55)]",
  slate: "bg-[linear-gradient(135deg,#94a3b8,#475569)] shadow-[0_8px_18px_-6px_rgba(71,85,105,0.5)]",
};
export const SOFT: Record<Tone, string> = {
  blue: "bg-[#eef4ff] text-[#2563eb]",
  teal: "bg-[#e7f8f5] text-[#0f766e]",
  violet: "bg-[#f3efff] text-[#6d28d9]",
  amber: "bg-[#fff6e5] text-[#b45309]",
  red: "bg-[#fff0f0] text-[#dc2626]",
  green: "bg-[#ecfbf1] text-[#15803d]",
  slate: "bg-[#f1f4f8] text-[#475569]",
};

// Rəngli ikon kafeli
export function IconTile({ icon: Icon, tone, size = 44 }: { icon: LucideIcon; tone: Tone; size?: number }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-2xl text-white ${GRAD[tone]}`} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.45)} strokeWidth={2.2} />
    </span>
  );
}

// Pəncərə başlığı: modalın üst hissəsini tam endə tutur (yumşaq fon, rəngli ikon, başlıq, alt yazı, sağda düymələr + bağla).
// Modalın standart 24px daxili boşluğuna görə mənfi kənar boşluqlar.
// flush: daxili boşluğu olmayan pəncərədə (!p-0) mənfi kənar boşluqlar lazım deyil
export function DHead({ id, icon, tone, title, sub, onClose, children, flush = false }: {
  id: string; icon: LucideIcon; tone: Tone; title: string; sub?: React.ReactNode; onClose: () => void; children?: React.ReactNode; flush?: boolean;
}) {
  return (
    <div className={`${flush ? "" : "-mx-6 -mt-6 max-sm:-mx-4 max-sm:-mt-5 mb-5 "}flex items-center gap-3.5 rounded-t-[18px] border-b border-line bg-[linear-gradient(180deg,#f7f9fd,#ffffff)] px-6 max-sm:px-4 py-4`}>
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <h2 id={id} className="truncate text-[17px] font-bold leading-tight tracking-[-0.01em] max-sm:line-clamp-2 max-sm:whitespace-normal max-sm:text-[15px]">{title}</h2>
        {sub && <div className="muted mt-0.5 truncate text-[13px] max-sm:!whitespace-normal max-sm:line-clamp-2 max-sm:text-xs max-sm:leading-snug">{sub}</div>}
      </div>
      {children}
      <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
    </div>
  );
}

// Göstərici kafeli (pəncərələrdə və ümumi baxışda)
export function DStat({ icon: Icon, tone, label, value, hint }: { icon: LucideIcon; tone: Tone; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-3.5">
      <span className={`inline-grid h-8 w-8 place-items-center rounded-xl ${SOFT[tone]}`}><Icon size={16} /></span>
      <p className="mt-2 text-xs font-semibold text-muted">{label}</p>
      <p className="truncate text-xl font-extrabold tabular-nums leading-tight">{value}</p>
      {hint && <p className="muted truncate text-[11px]">{hint}</p>}
    </div>
  );
}

// Bölmə başlığı (pəncərə içində)
export function DSection({ title, count, children, className = "" }: { title: string; count?: number; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mt-5 ${className}`}>
      <h3 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ink/80">
        {title}
        {count !== undefined && <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">{count}</span>}
      </h3>
      {children}
    </section>
  );
}

// Əməliyyat kafeli: ikon üstdə, yazı altda (Mədaxil, Silinmə, Təmirə, Hərəkətlər)
export function DAction({ icon: Icon, tone, label, onClick }: { icon: LucideIcon; tone: Tone; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="group flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-2 py-3 text-[12px] font-semibold text-ink/80 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_10px_24px_-10px_rgba(16,24,40,0.25)]">
      <span className={`grid h-9 w-9 place-items-center rounded-xl transition-transform group-hover:scale-105 ${SOFT[tone]}`}><Icon size={17} /></span>
      {label}
    </button>
  );
}
