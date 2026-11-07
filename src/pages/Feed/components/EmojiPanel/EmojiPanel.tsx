import { useState } from "react";
import { EMOJI_CATEGORIES } from "../../constants/emojis";

// Smaylik paketi: üstdə kateqoriyalar, altda 8 sütunlu şəbəkə; klik emojini yazıya əlavə edir (panel açıq qalır, bir neçə seçmək olar)
export function EmojiPanel({ onPick }: { onPick: (emoji: string) => void }) {
  const [cat, setCat] = useState(0);
  return (
    <div className="border-t border-line">
      <div className="flex justify-around px-2 py-1.5">
        {EMOJI_CATEGORIES.map((g, i) => (
          <button key={g.key} type="button" onClick={() => setCat(i)} aria-label={g.key}
            className={`grid h-9 w-11 place-items-center rounded-xl text-xl transition ${cat === i ? "bg-primary/15" : "hover:bg-surface-2"}`}>{g.icon}</button>
        ))}
      </div>
      <div className="grid h-[180px] grid-cols-8 content-start gap-0.5 overflow-y-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {EMOJI_CATEGORIES[cat].list.map((e) => (
          <button key={e} type="button" onClick={() => onPick(e)} className="grid h-10 place-items-center rounded-lg text-2xl transition hover:scale-125 hover:bg-surface-2">{e}</button>
        ))}
      </div>
    </div>
  );
}
