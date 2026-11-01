import s from "@/shared/styles/IconTile.module.css";

// Açıq mavi ikon kvadratı
export const iconTileClass = (extra = "") => (extra ? `${s.tile} ${extra}` : s.tile);
