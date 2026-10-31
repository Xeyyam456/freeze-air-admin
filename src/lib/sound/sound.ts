// Qısa bildiriş səsi (~0.3 san., iki not), fayl yoxdur: Web Audio ilə yaradılır.
// Brauzer səsi yalnız istifadəçi səhifədə nəsə basandan sonra açır. Ona görə səs mexanizmi
// ilk klik/düymə anında "açılır" (unlock) və müraciət gələndə hazır olur.
let ctx: AudioContext | null = null;

function unlock() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // səs dəstəklənmirsə, sadəcə tost qalır
  }
}

if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "keydown", "touchstart"] as const) {
    window.addEventListener(type, unlock, { passive: true });
  }
}

// Səs hazırdırmı (bu səhifədə ən azı bir klik/düymə olub)? Yoxdursa brauzer səsə icazə vermir.
export function isSoundReady() {
  return !!ctx && ctx.state === "running";
}

export function playNotify() {
  try {
    unlock();
    if (!ctx || ctx.state !== "running") return; // hələ heç bir klik olmayıb: brauzer icazə vermir
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const start = now + i * 0.12;
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.35, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.22);
    });
  } catch {
    // səs dəstəklənmirsə, sadəcə tost qalır
  }
}
