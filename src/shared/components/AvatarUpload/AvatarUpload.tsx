import { ImagePlus, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar } from "@/shared/components/Avatar";
import type { AvatarUploadProps } from "@/types/employees";
import { useAvatarUpload } from "./useAvatarUpload";
import { Button } from "@/shared/components/Button";

// Əməkdaşın şəkli: yüklə / sil, dəyişiklik dərhal saxlanır.
// Əməkdaşın özü və istənilən rəhbər (admin) görür (baza da yalnız onlara icazə verir: set_employee_photo, 0069).
export function AvatarUpload(props: AvatarUploadProps) {
  const { employee } = props;
  const { admin, employeeId } = useAuth();
  const { inputRef, photoUrl, pending, onFile, onRemove } = useAvatarUpload(props);

  if (!admin && employeeId !== employee.id) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-xl border border-line p-3">
      <Avatar employee={{ ...employee, photo_url: photoUrl }} className={`!h-16 !w-16 !text-lg ${pending ? "opacity-50" : ""}`} />
      <div className="min-w-[8rem] flex-1">
        <p className="text-sm font-semibold">Şəkil</p>
        <p className="muted text-xs">JPG, PNG və ya WebP. Kvadrat kəsilir.</p>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])} />
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={pending} variant="secondary" size="sm">
        <ImagePlus size={14} /> {pending ? "..." : photoUrl ? "Dəyiş" : "Yüklə"}
      </Button>
      {photoUrl && (
        <button type="button" onClick={onRemove} disabled={pending} className="icon-btn icon-btn-danger" title="Şəkli sil" aria-label="Şəkli sil">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
