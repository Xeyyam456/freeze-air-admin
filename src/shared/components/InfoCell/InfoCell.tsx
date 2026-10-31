import type { InfoCellProps } from "@/types/employees";

// Məlumat pəncərəsinin xanası: ikon + etiket, altında dəyər
export function InfoCell({ icon: Icon, label, className = "", children }: InfoCellProps) {
  return (
    <div className={`rounded-xl bg-bg px-3 py-2 ${className}`}>
      <p className="muted flex items-center gap-1.5 text-xs font-medium"><Icon size={13} /> {label}</p>
      {children}
    </div>
  );
}
