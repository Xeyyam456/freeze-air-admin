import { FileText, Video } from "lucide-react";
import { useState } from "react";
import type { FeedFilesProps } from "@/types/feed";
import { isImage } from "../../utils/isImage";
import { Lightbox } from "../Lightbox";

const SHOW = 9; // kartda ən çox 3 sətir (9 fayl), qalanı "+N"
const CELL = "relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-2";

// Faylların toru: sətir üzrə 3-3 düz sıra. Şəkil/akt şəkli → tam ekran (oxlarla keç); video və PDF → yeni tabda açılır
export function FeedFiles({ post }: FeedFilesProps) {
  const [view, setView] = useState<number | null>(null);
  const images = post.files.filter(isImage).map((f) => f.url as string);
  const rest = post.files.length - SHOW;

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {post.files.slice(0, SHOW).map((f, i) => {
          const more = i === SHOW - 1 && rest > 0;
          if (isImage(f)) {
            return (
              <button key={f.id} type="button" className={CELL} onClick={() => setView(images.indexOf(f.url as string))} aria-label={f.kind === "act" ? "Akt" : "Şəkil"}>
                {/* eslint-disable-next-line @next/next/no-img-element -- imzalı storage linki */}
                <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                {f.kind === "act" && <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 text-[10px] font-extrabold text-white">Akt</span>}
                {more && <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-extrabold text-white">+{rest + 1}</span>}
              </button>
            );
          }
          const Icon = f.kind === "video" ? Video : FileText;
          return (
            <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className={`${CELL} grid place-items-center text-primary`} aria-label={f.kind === "video" ? "Video" : "PDF akt"}>
              <span className="grid justify-items-center gap-1 text-[11px] font-extrabold"><Icon size={26} />{f.kind === "video" ? "Video" : f.path.endsWith(".pdf") ? "PDF akt" : "Şəkil"}</span>
            </a>
          );
        })}
      </div>
      {view !== null && <Lightbox images={images} start={view} onClose={() => setView(null)} />}
    </>
  );
}
