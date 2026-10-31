import { FileText, Video } from "lucide-react";
import type { LogFileTilesProps } from "@/types/workLogs";

// Akt və şəkillər yeni tabda açılır, video pəncərədə oynayır
export function LogFileTiles({ files, onPlay }: LogFileTilesProps) {
  const act = files.find((f) => f.kind === "act");
  const photos = files.filter((f) => f.kind === "photo");
  const videos = files.filter((f) => f.kind === "video");
  if (!act && photos.length === 0 && videos.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {act?.url && (
        <a href={act.url} target="_blank" rel="noopener noreferrer"
          className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold hover:border-primary">
          <FileText size={16} className="text-primary" /> Akt
        </a>
      )}
      {photos.map((p) => p.url && (
        <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" title="Şəkli böyüt">
          <img src={p.url} alt="İşin şəkli" className="h-14 w-14 rounded-lg border border-line object-cover hover:border-primary" />
        </a>
      ))}
      {videos.map((v) => v.url && (
        <button key={v.id} type="button" onClick={() => onPlay(v.url!)}
          className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold hover:border-primary">
          <Video size={16} className="text-primary" /> Video
        </button>
      ))}
    </div>
  );
}
