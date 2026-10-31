import { Building2, Store } from "lucide-react";
import { KIND } from "@/lib/kinds";
import type { EmptyUnitsProps } from "@/types/clients";

export function EmptyUnits({ kind }: EmptyUnitsProps) {
  const Icon = kind === "market" ? Store : Building2;
  return (
    <div className="card py-12 text-center">
      <span className="icon-tile mx-auto"><Icon size={20} /></span>
      <p className="mt-3 font-semibold">Hələ {KIND[kind].unit} yoxdur</p>
      <p className="muted text-sm">Sağdakı formdan tək-tək və ya Excel faylı ilə toplu əlavə et.</p>
    </div>
  );
}
