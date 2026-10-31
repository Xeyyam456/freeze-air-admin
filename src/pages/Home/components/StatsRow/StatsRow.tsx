import { Building2, ListChecks, Store, Users, Wrench } from "lucide-react";
import type { DashboardProps } from "@/types/dashboard";
import { Stat } from "./Stat";

// Göstəricilər (klik olunur): şirkət, market, usta, alət, tapşırıq
export function StatsRow({ d }: DashboardProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:max-lg:grid-cols-6 sm:max-lg:[&>*]:!col-span-2 sm:max-lg:[&>*:nth-child(n+4)]:!col-span-3 lg:grid-cols-5 [&>*:last-child]:col-span-2 lg:[&>*]:!col-span-1">
      <Stat to="/sirketler" icon={Building2} label="Şirkət" value={d?.companies} sub={d && `${d.branches} filial`} tone="from-[#0a7ea4] to-[#2dd4bf]" />
      <Stat to="/magazalar" icon={Store} label="Market" value={d?.markets} sub={d && `${d.shops} mağaza`} tone="from-[#0ea5a4] to-[#2dd4bf]" />
      <Stat to="/ustalar" icon={Users} label="Usta" value={d?.masters.length} sub={d && `${d.managers} rəhbər`} tone="from-[#6d5efc] to-[#0a7ea4]" />
      <Stat to="/depo" icon={Wrench} label="Alət" value={d?.tools.total} sub={d && `${d.tools.total - d.tools.out} depoda · ${d.tools.out} ustada`} tone="from-[#f59e0b] to-[#f97316]" />
      <Stat to="/tapshiriqlar" icon={ListChecks} label="Tapşırıq" value={d?.tasks.length} sub={d && `${d.tasks.filter((t) => t.done).length} görülüb · ${d.tasks.filter((t) => !t.done).length} qalıb`} tone="from-[#10b981] to-[#2dd4bf]" />
    </div>
  );
}
