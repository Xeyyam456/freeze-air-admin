import type { FeedFile } from "@/types/feed";

// Şəkil kimi göstərilən fayl: video və PDF deyil, imzalı linki var (aktın şəkli də şəkildir)
export const isImage = (f: FeedFile) => f.kind !== "video" && !f.path.endsWith(".pdf") && !!f.url;
