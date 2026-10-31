import type { EmptyStateProps } from "@/types/dashboard";

export function EmptyState({ icon: Icon, title, text }: EmptyStateProps) {
  return (
    <div className="mt-4 grid flex-1 place-items-center rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-bg text-muted"><Icon size={22} /></span>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="muted mt-1 max-w-xs text-sm">{text}</p>
    </div>
  );
}
