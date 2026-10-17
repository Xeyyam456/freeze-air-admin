import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { Tables } from "@/lib/database.types";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

const BUCKET = "avatars";
const SIZE = 512;

// Şəkli ortadan kvadrat kəsib 512px WebP-yə çevirir: yük az olur, hər yerdə eyni görünür
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(SIZE, side);
  canvas.getContext("2d")!.drawImage(
    bitmap,
    (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
    0, 0, canvas.width, canvas.height,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Şəkil çevrilmədi."))), "image/webp", 0.85));
}

// Köhnə şəkil bizim bucket-dədirsə, yolu (DiceBear kimi xarici linklər üçün null)
function storagePath(url: string | null) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  return url?.includes(marker) ? url.split(marker)[1] : null;
}

type Person = Pick<Tables<"employees">, "id" | "full_name" | "photo_url">;

// Əməkdaşın şəkli: yüklə / sil, dəyişiklik dərhal saxlanır.
// Yalnız əməkdaşın özü və müdir görür (baza da yalnız onlara icazə verir: set_employee_photo).
export function AvatarUpload({ employee, onChange }: { employee: Person; onChange?: () => void }) {
  const { owner, employeeId } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(employee.photo_url);
  const [pending, setPending] = useState(false);

  if (!owner && employeeId !== employee.id) return null;

  async function save(url: string | null) {
    const supabase = createClient();
    const { error: upErr } = await supabase.rpc("set_employee_photo", { p_employee_id: employee.id, p_url: url });
    if (upErr) throw upErr;
    const old = storagePath(photoUrl);
    if (old) await supabase.storage.from(BUCKET).remove([old]);
    setPhotoUrl(url);
    toast.success(url ? "Şəkil yadda saxlanıldı" : "Şəkil silindi");
    revalidate();
    onChange?.();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Yalnız şəkil faylı seç.");
    setPending(true);
    try {
      const blob = await toSquareWebp(file);
      const path = `${employee.id}/${crypto.randomUUID()}.webp`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp" });
      if (upErr) throw upErr;
      await save(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    } catch {
      toast.error("Şəkil yüklənmədi. Başqa şəkil yoxla.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    setPending(true);
    try {
      await save(null);
    } catch {
      toast.error("Şəkil silinmədi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-line p-3">
      <Avatar employee={{ ...employee, photo_url: photoUrl }} className={`!h-16 !w-16 !text-lg ${pending ? "opacity-50" : ""}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Şəkil</p>
        <p className="muted text-xs">JPG, PNG və ya WebP. Kvadrat kəsilir.</p>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={pending} className="btn btn-secondary btn-sm">
        <ImagePlus size={14} /> {pending ? "..." : photoUrl ? "Dəyiş" : "Yüklə"}
      </button>
      {photoUrl && (
        <button type="button" onClick={onRemove} disabled={pending} className="icon-btn icon-btn-danger" title="Şəkli sil" aria-label="Şəkli sil">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
