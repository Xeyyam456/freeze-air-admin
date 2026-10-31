import { AVATAR_BUCKET } from "./constants";

// Köhnə şəkil bizim bucket-dədirsə, yolu (DiceBear kimi xarici linklər üçün null)
export function storagePath(url: string | null) {
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  return url?.includes(marker) ? url.split(marker)[1] : null;
}
