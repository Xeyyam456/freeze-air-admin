import type { IconTileProps } from "@/types/depot";
import { GRAD } from "../../constants/tones";

// Rəngli ikon kafeli
export function IconTile({ icon: Icon, tone, size = 44 }: IconTileProps) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-2xl text-white ${GRAD[tone]}`} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.45)} strokeWidth={2.2} />
    </span>
  );
}
