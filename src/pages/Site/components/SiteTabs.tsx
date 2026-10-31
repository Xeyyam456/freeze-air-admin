import { SITE_TABS, type SiteTab } from "../constants/siteTabs";

// Tab düymələri: dar ekranda iki sütun, ≥ 640 bir sətir
export function SiteTabs({ tab, onTab }: { tab: SiteTab; onTab: (t: SiteTab) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-line/60 p-1 sm:inline-flex sm:w-fit sm:max-w-full sm:flex-wrap" role="tablist">
        {SITE_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => onTab(id)}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors max-sm:last:odd:col-span-2 ${
              tab === id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
