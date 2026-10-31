import { useState } from "react";
import type { TitleSlug } from "@/types/site";
import { slugify } from "../utils/slugify";

// Ad və ünvan (açar): mövcud elementdə ünvan sabit qalır, yenidə addan avtomatik yaranır (əl ilə dəyişənə qədər)
export function useTitleSlug(initialTitle: string, initialSlug: string, existing: boolean): TitleSlug {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [touched, setTouched] = useState(existing);

  return {
    title,
    slug,
    onTitle: (v) => { setTitle(v); if (!touched) setSlug(slugify(v)); },
    onSlug: (v) => { setSlug(v.toLowerCase()); setTouched(true); },
  };
}
