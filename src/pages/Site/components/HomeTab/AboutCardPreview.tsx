import { ClipboardCheck } from "lucide-react";
import type { AboutCardPreviewProps } from "@/types/site";

// Kartın canlı önizləməsi: saytdakı kimi
export function AboutCardPreview({ title, text, color: c }: AboutCardPreviewProps) {
  return (
    <div className="rounded-2xl bg-[#eaf3f8] p-4">
      <p className="mb-2 text-[11px] font-semibold text-muted">Kart saytda belə görünəcək</p>
      <div className="flex max-w-xs flex-col justify-center rounded-[22px] p-5 shadow-sm" style={{ background: c.bg, color: c.fg }}>
        <ClipboardCheck size={26} style={{ color: c.icon }} />
        <p className="mt-3 text-base font-extrabold">{title || "Hər iş qeydə alınır"}</p>
        {text && <p className="mt-1 text-xs" style={{ color: c.sub }}>{text}</p>}
      </div>
    </div>
  );
}
