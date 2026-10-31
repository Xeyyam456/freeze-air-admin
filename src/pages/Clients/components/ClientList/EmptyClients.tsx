import { Building2, Store } from "lucide-react";
import { KIND } from "@/lib/kinds";
import type { EmptyClientsProps } from "@/types/clients";
import { Card } from "@/shared/components/Card";

export function EmptyClients({ kind, hint }: EmptyClientsProps) {
  const Icon = kind === "market" ? Store : Building2;
  return (
    <Card className="py-12 text-center">
      <span className="icon-tile mx-auto"><Icon size={20} /></span>
      <p className="mt-3 font-semibold">Hələ {KIND[kind].one} yoxdur</p>
      <p className="muted text-sm">{hint}</p>
    </Card>
  );
}
