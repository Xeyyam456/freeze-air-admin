import type { DSectionProps } from "@/types/depot";

// Bölmə başlığı (pəncərə içində)
export function DSection({ title, count, children, className = "" }: DSectionProps) {
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
