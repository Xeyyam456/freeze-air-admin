import { Fuel } from "lucide-react";

export function NoCars() {
  return (
    <div className="card py-12 text-center">
      <span className="icon-tile mx-auto"><Fuel size={20} /></span>
      <p className="mt-3 font-semibold">Maşını olan usta yoxdur</p>
      <p className="muted text-sm">Ustalar səhifəsində ustanın redaktəsində «Maşın: Var» seç və nömrəni yaz.</p>
    </div>
  );
}
