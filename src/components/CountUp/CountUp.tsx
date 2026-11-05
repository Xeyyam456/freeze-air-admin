import type { CountUpProps } from "@/types/shared";
import { useEffect, useRef, useState } from "react";

// Rəqəm sayılaraq açılır: əvvəl sürətli, sona doğru yavaşlayır (ease-out).
// Dəyər dəyişəndə köhnə rəqəmdən yenisinə keçir. "Azaldılmış hərəkət" ayarında birbaşa göstərilir.
// decimals: kəsr hissənin rəqəm sayı (gündəlik orta kimi); rəqəm "az" formatında yazılır.
export function CountUp({ value, duration = 2500, decimals = 0 }: CountUpProps) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = 10 ** decimals;
    let frame = 0;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 4); // easeOutQuart

    const tick = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      const current = Math.round((from + (value - from) * ease(t)) * p) / p;
      setShown(current);
      fromRef.current = current;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, decimals]);

  return <>{shown.toLocaleString("az")}</>;
}
