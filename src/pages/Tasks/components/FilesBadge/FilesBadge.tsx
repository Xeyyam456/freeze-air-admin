import { Paperclip } from "lucide-react";
import type { FilesBadgeProps } from "@/types/tasks";
import { VideoBadge } from "../VideoBadge";

// Ustanın iş qeydinə əlavə etdiyi fayllar: video nişanı + fayl sayı
export function FilesBadge({ files, video }: FilesBadgeProps) {
  return (
    <>{video && <VideoBadge />}<span className="muted mt-1 inline-flex shrink-0 items-center gap-0.5 text-xs" title="Usta fayl əlavə edib (iş qeydində)"><Paperclip size={13} />{files}</span></>
  );
}
