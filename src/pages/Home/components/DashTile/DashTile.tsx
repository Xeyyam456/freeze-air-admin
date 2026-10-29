import type { DashTileProps } from "@/types/dashboard";

// Şüşə effektli xana (tünd fonda)
export function DashTile({ icon: Icon, label, value, children }: DashTileProps) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:items-center max-sm:gap-x-3 max-sm:px-3.5 max-sm:py-3">
      <div className="flex items-center gap-2 text-white/60">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 text-frost"><Icon size={13} /></span>
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-4xl font-extrabold leading-none tracking-tight text-white max-sm:col-start-2 max-sm:row-span-2 max-sm:row-start-1 max-sm:mt-0 max-sm:text-3xl">{value}</p>
      {children && <div className="mt-2 text-xs font-semibold max-sm:mt-1">{children}</div>}
    </div>
  );
}
