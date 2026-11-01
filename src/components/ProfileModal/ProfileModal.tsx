import { IconTile } from "@/shared/components/IconTile";
import { IconButton } from "@/shared/components/IconButton";
import { useState } from "react";
import { UserRound, X } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { AvatarUpload } from "@/shared/components/AvatarUpload";
import { FormActions } from "@/shared/components/FormActions";
import { Modal } from "@/shared/components/Modal";
import { updateProfileName } from "@/services/profile/updateProfileName";
import { toast } from "@/lib/toast";
import { Input } from "@/shared/components/Input";
import { FormField } from "@/shared/components/FormField";

// Profil: hesabın adı. Əməkdaşa bağlı hesabda ad əməkdaş kartından gəlir və orada dəyişdirilir.
export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { session, email, name, linked, employeeId, photoUrl, reload } = useAuth();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fullName = String(new FormData(e.currentTarget).get("full_name") ?? "").trim();
    if (!fullName) return toast.error("Ad vacibdir.");
    if (!session) return;
    setPending(true);
    const upErr = await updateProfileName(session.user.id, fullName);
    setPending(false);
    if (upErr) return toast.error(upErr);
    await reload();
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="profile-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile className="!h-11 !w-11 shrink-0 max-sm:hidden"><UserRound size={20} /></IconTile>
          <div className="min-w-0">
            <h2 id="profile-title" className="text-lg font-bold">Profil</h2>
            <p className="muted break-all text-sm leading-tight max-sm:text-[12px]">{email}</p>
          </div>
        </div>
        <IconButton onClick={onClose} className="shrink-0" aria-label="Bağla"><X size={18} /></IconButton>
      </div>

      {linked && employeeId && (
        <div className="mb-4">
          <AvatarUpload employee={{ id: employeeId, full_name: name ?? "", photo_url: photoUrl }} onChange={reload} />
        </div>
      )}
      {linked ? (
        <p className="muted text-sm">
          Bu hesab <b className="text-ink">{name}</b> adlı əməkdaşa bağlıdır. Adı Ustalar və ya Rəhbərlik bölməsində əməkdaşın kartından dəyiş.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Ad və soyad">
            <Input name="full_name" defaultValue={name ?? ""} placeholder="Məs. Məmmədov Əli" required autoFocus />
          </FormField>
          <FormActions pending={pending} label="Yadda saxla" onCancel={onClose} />
        </form>
      )}
    </Modal>
  );
}
