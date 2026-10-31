import { Search } from "lucide-react";
import { StoreCard } from "@/components/StoreCard";
import { KIND } from "@/lib/kinds";
import type { UnitListProps } from "@/types/clients";
import { useUnitFilter } from "../../hooks/useUnitFilter";
import { StoreAdminCard } from "../StoreAdminCard";
import { EmptyUnits } from "./EmptyUnits";
import { Card } from "@/shared/components/Card";

// Şirkətin filialları və ya marketin mağazaları: axtarış + kartlar
export function UnitList({ units, kind, admin }: UnitListProps) {
  const { query, setQuery, filtered } = useUnitFilter(units);
  const k = KIND[kind];

  if (units.length === 0) return <EmptyUnits kind={kind} />;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Axtarış və tablar yerində qalır; yalnız aşağıdakı siyahı bloku öz içində sürüşür (scrollbar gizli) */}
      <div className="search shrink-0">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${k.Unit} kodu, adı və ya ünvanı ilə axtar...`}
          aria-label={`${k.Unit} axtarışı`}
        />
      </div>

      {query && (
        <p className="muted shrink-0 text-sm font-medium">
          {filtered.length} {k.unit} tapıldı / cəmi {units.length}
        </p>
      )}

      {filtered.length === 0 ? (
        <Card className="muted py-10 text-center text-sm">Bu axtarışa uyğun {k.unit} tapılmadı.</Card>
      ) : (
        <div className="-mx-1 -my-1 min-h-0 flex-1 overflow-y-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-2 lg:max-[1199px]:grid-cols-1">
            {filtered.map((u) =>
              admin ? <StoreAdminCard key={u.id} store={u} kind={kind} /> : <StoreCard key={u.id} store={u} />,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
