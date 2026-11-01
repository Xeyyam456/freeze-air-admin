import { IconTile } from "@/shared/components/IconTile";
import { Fuel } from "lucide-react";
import { Card } from "@/shared/components/Card";

export function NoCars() {
  return (
    <Card className="py-12 text-center">
      <IconTile className="mx-auto"><Fuel size={20} /></IconTile>
      <p className="mt-3 font-semibold">Maşını olan usta yoxdur</p>
      <p className="muted text-sm">Ustalar səhifəsində ustanın redaktəsində «Maşın: Var» seç və nömrəni yaz.</p>
    </Card>
  );
}
