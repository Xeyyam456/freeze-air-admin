import { Link } from "react-router";
import { FileSpreadsheet, Globe, Plus, UserPlus } from "lucide-react";

const LINKS = [
  { to: "/sirketler", icon: Plus, label: "Yeni şirkət" },
  { to: "/ustalar", icon: UserPlus, label: "Yeni usta" },
  { to: "/magazalar", icon: FileSpreadsheet, label: "Excel-dən mağaza" },
  { to: "/sayt", icon: Globe, label: "Saytı redaktə et" },
];

// Sürətli keçidlər
export function QuickLinks() {
  return (
    <section className="card">
      <h2 className="card-title">Sürətli keçidlər</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <Link key={label} to={to}
            className="group flex flex-col gap-3 rounded-xl border border-line p-3.5 transition-colors hover:border-primary hover:bg-primary-soft">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-bg text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Icon size={18} /></span>
            <span className="text-sm font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
