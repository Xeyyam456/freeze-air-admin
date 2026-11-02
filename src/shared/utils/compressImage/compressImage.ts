// İş şəkillərini yükləmədən əvvəl brauzerdə kiçilt: WebP, ən uzun tərəf maxSide px.
// Səbəb (2026-11-02): telefon şəkli 3–6 MB idi (Free plan storage 1 GB tez dolurdu, zəif şəbəkədə yükləmə uzun çəkirdi);
// sıxılmış ~200–400 KB olur. Şəkil olmayan fayl (video, PDF), çevrilə bilməyən format (HEIC və s.) və ya
// sıxılmış nəticə daha böyükdürsə — orijinal olduğu kimi qaytarılır.
export async function compressImage(file: File, maxSide = 1600) {
  const original = { body: file as Blob, type: file.type, ext: extOf(file) };
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return original;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.82));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return original;
    return { body: blob, type: "image/webp", ext: "webp" };
  } catch {
    return original;
  }
}

function extOf(file: File) {
  return file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
}
