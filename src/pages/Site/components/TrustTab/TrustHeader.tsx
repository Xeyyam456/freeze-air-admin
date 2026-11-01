import { iconTileClass } from "@/shared/components/IconTile";
import { cardTitleClass } from "@/shared/components/Card";
import { Plus } from "lucide-react";
import type { TrustHeaderProps } from "@/types/site";
import { Button } from "@/shared/components/Button";

// Bölmənin başlığı: ikon, ad, izah və "Yeni ..." düyməsi
export function TrustHeader({ icon: Icon, title, text, addLabel, onAdd }: TrustHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className={iconTileClass("!h-9 !w-9")}><Icon size={18} /></span>
        <div>
          <h2 className={cardTitleClass()}>{title}</h2>
          <p className="muted text-sm">{text}</p>
        </div>
      </div>
      <Button type="button" onClick={onAdd} size="sm"><Plus size={14} /> {addLabel}</Button>
    </div>
  );
}
