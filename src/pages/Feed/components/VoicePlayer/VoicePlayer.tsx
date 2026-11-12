import { Loader2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { voiceUrl } from "@/services/feed/voiceUrl";
import type { FeedAudio } from "@/types/feed";
import { fmtMs } from "../../utils/fmtMs";

const RATES = [1, 1.5, 2];
let current: HTMLAudioElement | null = null; // bir anda yalnız bir səs oxunur

// Səs şərhi (WhatsApp kimi): oxut/dayandır, dalğa zolağı (oxunan hissə rənglənir, toxunanda həmin yerə keçir), müddət, sürət 1x → 1.5x → 2x.
// Fayl ilk basışda yüklənir (imzalı link, bucket gizlidir)
export function VoicePlayer({ audio, mine }: { audio: FeedAudio; mine: boolean }) {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState(0);
  const [rate, setRate] = useState(0);
  const total = Math.max(0.1, audio.ms / 1000);
  const progress = Math.min(1, pos / total);

  useEffect(() => () => { el.current?.pause(); if (current === el.current) current = null; }, []);

  const load = async (): Promise<HTMLAudioElement | null> => {
    if (el.current) return el.current;
    setBusy(true);
    try {
      const a = new Audio(audio.local ?? await voiceUrl(audio.path));
      a.addEventListener("timeupdate", () => setPos(a.currentTime));
      a.addEventListener("play", () => setPlaying(true));
      a.addEventListener("pause", () => setPlaying(false));
      a.addEventListener("ended", () => { setPlaying(false); setPos(0); });
      el.current = a;
      return a;
    } catch { return null; } finally { setBusy(false); }
  };

  const toggle = async () => {
    const a = await load();
    if (!a) return;
    if (playing) { a.pause(); return; }
    if (current && current !== a) current.pause();
    current = a;
    a.playbackRate = RATES[rate];
    void a.play();
  };
  const seek = async (e: React.MouseEvent<HTMLDivElement>) => {
    const a = await load();
    if (!a) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * total;
    setPos(a.currentTime);
  };
  const cycle = () => { const n = (rate + 1) % RATES.length; setRate(n); if (el.current) el.current.playbackRate = RATES[n]; };

  return (
    <div className="flex w-[240px] items-center gap-2.5">
      <button type="button" onClick={toggle} aria-label={playing ? "Dayandır" : "Oxut"}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:brightness-110">
        {busy ? <Loader2 size={18} className="animate-spin" /> : playing ? <Pause size={18} /> : <Play size={18} className="translate-x-px" />}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div onClick={seek} className="flex h-7 cursor-pointer items-center gap-px overflow-hidden" role="slider" aria-label="Səs mövqeyi" aria-valuenow={Math.round(progress * 100)}>
          {audio.peaks.map((p, i) => (
            <span key={i} className={`min-w-[1.5px] flex-1 rounded-[1px] ${i < progress * audio.peaks.length ? "bg-primary" : mine ? "bg-primary/30" : "bg-muted/40"}`} style={{ height: `${Math.max(12, p)}%` }} />
          ))}
        </div>
        <span className="muted text-[11px] font-bold tabular-nums">{fmtMs((playing || pos > 0 ? pos : total) * 1000)}</span>
      </div>
      <button type="button" onClick={cycle} aria-label="Sürət" className="grid h-6 min-w-[34px] place-items-center rounded-full bg-surface px-1.5 text-[11px] font-extrabold">{RATES[rate]}x</button>
    </div>
  );
}
