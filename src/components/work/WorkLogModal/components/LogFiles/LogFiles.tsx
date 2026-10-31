import { FileText, Play } from "lucide-react";
import type { LogFilesProps } from "@/types/workLogs";

// Akt, şəkillər və video (0089): hamısı kiçik plitədir, klik → pəncərədə açılır
export function LogFiles({ log, onView }: LogFilesProps) {
  const act = log.files.find((f) => f.kind === "act");
  const photos = log.files.filter((f) => f.kind === "photo");
  const videos = log.files.filter((f) => f.kind === "video");
  if (!act && photos.length === 0 && videos.length === 0) return null;
  return (
    <div>
      <span className="label">{videos.length ? "Akt, şəkillər və video" : "Akt və şəkillər"}</span>
      <div className="flex flex-wrap gap-2">
        {act?.url && (
          <button type="button" onClick={() => onView({ url: act.url!, title: "Akt", pdf: /\.pdf($|\?)/i.test(act.path) })}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-bg text-xs font-semibold hover:border-primary">
            <FileText size={22} className="text-primary" /> Akt
          </button>
        )}
        {photos.map((p) => p.url && (
          <button key={p.id} type="button" onClick={() => onView({ url: p.url!, title: "İşin şəkli", pdf: false })} title="Şəkli böyüt">
            <img src={p.url} alt="İşin şəkli" className="h-24 w-24 rounded-xl border border-line object-cover hover:border-primary" />
          </button>
        ))}
        {videos.map((v) => v.url && (
          <button key={v.id} type="button" onClick={() => onView({ url: v.url!, title: "İşin videosu", pdf: false, video: true })} title="Videonu aç"
            className="relative h-24 w-24 overflow-hidden rounded-xl border border-line bg-black hover:border-primary">
            {/* İlk kadr önizləmə kimi (yalnız metadata yüklənir) */}
            <video src={`${v.url}#t=0.1`} muted playsInline preload="metadata" className="pointer-events-none h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/25">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary shadow"><Play size={16} className="translate-x-px" fill="currentColor" /></span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
