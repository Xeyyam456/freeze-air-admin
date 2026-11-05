import type { RecentRowProps } from "@/types/dashboard";
import { AvatarStack } from "../AvatarStack";
import { placeName } from "../../utils/placeName";
import s from "./RecentWork.module.css";

const time = (iso: string) => new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

// Cədvəlin sətri: usta, iş yeri (mağaza + şirkət), vaxt; sırası ilə gəlir, canlı düşən iş qısa müddət vurğulanır
export function RecentRow({ row, index, fresh, onOpen }: RecentRowProps) {
  const who = row.employees?.full_name ?? "—";
  return (
    <button type="button" className={`${s.row} ${fresh ? s.fresh : ""}`} style={{ "--i": index } as React.CSSProperties} onClick={() => onOpen(row.id)}>
      <span className={s.who}>
        <AvatarStack people={[{ full_name: who.split(" + ")[0], photo_url: row.employees?.photo_url ?? null }]} />
        <span>{who}</span>
      </span>
      <span className={s.place}>
        <b>{row.stores?.name ?? row.companies?.name ?? row.place_text ?? "—"}</b>
        {row.stores && <small>{placeName(row)}</small>}
      </span>
      <span className={s.time}>{time(row.created_at)}</span>
    </button>
  );
}
