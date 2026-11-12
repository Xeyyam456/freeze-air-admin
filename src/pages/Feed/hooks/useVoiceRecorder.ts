import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import type { VoiceResult } from "@/types/feed";
import { toPeaks } from "../utils/toPeaks";

type Live = { rec: MediaRecorder; stream: MediaStream; ctx: AudioContext; chunks: Blob[]; levels: number[]; t0: number; timer: number };
const MIN_MS = 700;

// Brauzerdə səs yazıcı: start (mikrofon icazəsi → yazı), finish (saxla və nəticəni ver), cancel (at).
// Format brauzerin dəstəklədiyidir (Chrome/Edge/Firefox: webm-opus, Safari: mp4); səviyyə 100 ms-dən bir ölçülür (dalğa zolağı üçün)
export function useVoiceRecorder() {
  const live = useRef<Live | null>(null);
  const [on, setOn] = useState(false);
  const [ms, setMs] = useState(0);

  const start = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 64000 });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      const chunks: Blob[] = [];
      const levels: number[] = [];
      const t0 = Date.now();
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const timer = window.setInterval(() => {
        an.getByteTimeDomainData(buf);
        let s = 0;
        for (const v of buf) { const d = (v - 128) / 128; s += d * d; }
        levels.push(Math.min(100, Math.sqrt(s / buf.length) * 400));
        setMs(Date.now() - t0);
      }, 100);
      rec.start(1000);
      live.current = { rec, stream, ctx, chunks, levels, t0, timer };
      setMs(0);
      setOn(true);
      return true;
    } catch {
      toast.error("Mikrofon açılmadı", "Brauzerdə mikrofon icazəsi ver");
      return false;
    }
  }, []);

  const halt = useCallback((): Promise<VoiceResult | null> => new Promise((res) => {
    const c = live.current;
    live.current = null;
    if (!c) return res(null);
    window.clearInterval(c.timer);
    const ms = Date.now() - c.t0;
    c.rec.onstop = () => {
      c.stream.getTracks().forEach((t) => t.stop());
      void c.ctx.close();
      res({ blob: new Blob(c.chunks, { type: c.rec.mimeType }), ms, peaks: toPeaks(c.levels), mime: c.rec.mimeType });
    };
    if (c.rec.state !== "inactive") c.rec.stop(); else c.rec.onstop?.(new Event("stop"));
    setOn(false);
  }), []);

  const finish = useCallback(async (): Promise<VoiceResult | null> => {
    const v = await halt();
    if (v && v.ms < MIN_MS) { toast.error("Səs çox qısadır", "Mikrofona bas, danış, sonra göndər"); return null; }
    return v;
  }, [halt]);

  useEffect(() => () => { void halt(); }, [halt]);
  return { on, ms, start, finish, cancel: () => { void halt(); } };
}
