import { Plus, UsersRound, X } from "lucide-react";
import type { CrewsHeadProps } from "@/types/tasks";
import { Button } from "@/shared/components/Button";

// Briqadalar pəncərəsinin başlıq zolağı (admin palitrası); onCreate: siyahı görünüşündə "Yeni briqada"
export function CrewsHead({ title, onCreate, onClose }: CrewsHeadProps) {
  return (
    <div className="flex items-center gap-3 bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] px-6 py-5 text-white">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-frost"><UsersRound size={22} /></span>
      <div className="min-w-0 flex-1">
        <h2 id="crews-title" className="text-lg font-bold">{title}</h2>
        <p className="text-xs text-white/60">Birlikdə işləyən ustalar · bir usta yalnız bir briqadada</p>
      </div>
      {onCreate && (
        <Button type="button" onClick={onCreate} variant="plain" size="sm" className="shrink-0 !bg-white !text-[#0b1324] hover:!bg-frost">
          <Plus size={15} /> Yeni briqada
        </Button>
      )}
      <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla"><X size={18} /></button>
    </div>
  );
}
