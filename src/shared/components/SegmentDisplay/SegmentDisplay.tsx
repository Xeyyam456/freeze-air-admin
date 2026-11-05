import type { SegmentDisplayProps } from "@/types/shared";
import { GLYPHS } from "@/shared/constants/glyphs";
import { SEGMENTS, type SegmentName } from "@/shared/constants/segments";
import s from "@/shared/styles/SegmentDisplay.module.css";

const NAMES = Object.keys(SEGMENTS) as SegmentName[];

// 14 seqmentli LCD rəqəmləri (pult ekranı kimi): sönük seqmentlər də görünür, yananlar parlayır.
// Xəta kodlarında kod (2 yer, sola), Paneldə saylar (sağa sıxılır) üçün işlənir.
export function SegmentDisplay({ text, digits = 2, align = "left", className = "" }: SegmentDisplayProps) {
  const up = text.toUpperCase().slice(-digits);
  const chars = (align === "right" ? up.padStart(digits, " ") : up.padEnd(digits, " ")).split("");
  return (
    <div className={`${s.root} ${className}`} role="img" aria-label={text || "boş"}>
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
