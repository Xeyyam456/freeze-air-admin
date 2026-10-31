import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import type { StatProps } from "@/types/dashboard";

export function Stat({ to, icon: Icon, label, value, sub, tone }: StatProps) {
  return (
    <Link to={to} className="card card-link group relative overflow-hidden max-sm:!p-3.5 sm:max-xl:!p-3.5">
      <div className="relative flex items-center gap-4 max-sm:gap-3 sm:max-xl:gap-2.5">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl max-sm:h-10 max-sm:w-10 max-sm:rounded-xl sm:max-xl:h-9 sm:max-xl:w-9 sm:max-xl:rounded-xl bg-gradient-to-br ${tone} text-white shadow-[0_8px_18px_rgba(10,126,164,0.22)]`}>
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <div className="stat-value leading-none max-sm:!text-2xl sm:max-xl:!text-2xl">{value == null ? "–" : <CountUp value={value} />}</div>
          <div className="muted mt-1 text-sm font-medium">{label}</div>
        </div>
        <ArrowRight size={18} className="ml-auto text-muted opacity-0 transition-opacity group-hover:opacity-100 sm:max-xl:hidden" />
      </div>
      <p className="relative mt-4 truncate border-t border-line pt-3 text-xs font-semibold text-muted max-sm:mt-3 max-sm:pt-2 sm:max-xl:mt-2.5 sm:max-xl:pt-2">{sub || " "}</p>
    </Link>
  );
}
