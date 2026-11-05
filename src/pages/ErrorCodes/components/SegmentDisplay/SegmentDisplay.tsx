import type { SegmentDisplayProps } from "@/types/errorCodes";
import { GLYPHS } from "../../constants/glyphs";
import { SEGMENTS, type SegmentName } from "../../constants/segments";
import s from "./SegmentDisplay.module.css";

const NAMES = Object.keys(SEGMENTS) as SegmentName[];

// Pult ekranı: iki 14 seqmentli rəqəm. Sönük seqmentlər də görünür (real LCD kimi), yananlar parlayır.
export function SegmentDisplay({ text, className = "" }: SegmentDisplayProps) {
  const chars = text.toUpperCase().padEnd(2, " ").slice(0, 2).split("");
  return (
    <div className={`${s.root} ${className}`} role="img" aria-label={text ? `Kod ${text}` : "Kod yazılmayıb"}>
      {chars.map((ch, i) => {
        const lit = new Set(GLYPHS[ch] ?? []);
        return (
          <svg key={i} viewBox="0 0 60 100" className={s.digit} aria-hidden="true">
            <g transform="skewX(-7) translate(7 0)">
              {NAMES.map((n) => {
                const [x1, y1, x2, y2] = SEGMENTS[n];
                return <line key={n} x1={x1} y1={y1} x2={x2} y2={y2} className={lit.has(n) ? s.on : s.off} />;
              })}
            </g>
          </svg>
        );
      })}
    </div>
  );
}
