import { FileText, Image as ImageIcon, Play } from "lucide-react";
import type { FileCount } from "@/lib/jobs";

// İşin faylları siyahıda nişan kimi: ▶ video, şəkil sayı, akt — işi açmadan görünsün (qrup işində qrupun bütün faylları, fetchFileCounts).
// Web-də eyni fayl: components/work/FileBadges.tsx
export function FileBadges({ files, className = "" }: { files?: FileCount; className?: string }) {
  if (!files || files.act + files.photo + files.video === 0) return null;
  return (
    <span className={`flex shrink-0 items-center gap-1 ${className}`}>
      {files.video > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700" title="İşdə video var">
          <Play size={10} fill="currentColor" /> Video{files.video > 1 && ` ${files.video}`}
        </span>
      )}
      {files.photo > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted" title={`${files.photo} şəkil`}>
          <ImageIcon size={11} /> {files.photo}
        </span>
      )}
      {files.act > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted" title="Akt var">
          <FileText size={11} /> Akt
        </span>
      )}
    </span>
  );
}
