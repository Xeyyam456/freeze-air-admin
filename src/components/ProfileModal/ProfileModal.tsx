import { useState } from "react";
import { UserRound, X } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { AvatarUpload } from "@/shared/components/AvatarUpload";
import { Buttons, Field } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { Input } from "@/shared/components/Input";

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
    const { error: upErr } = await createClient().from("profiles").update({ full_name: fullName }).eq("id", session.user.id);
    setPending(false);
    if (upErr) return toast.error(upErr.message);
    await reload();
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="profile-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="icon-tile !h-11 !w-11 shrink-0 max-sm:hidden"><UserRound size={20} /></span>
          <div className="min-w-0">
            <h2 id="profile-title" className="text-lg font-bold">Profil</h2>
            <p className="muted break-all text-sm leading-tight max-sm:text-[12px]">{email}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn shrink-0" aria-label="Bağla"><X size={18} /></button>
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
          <Field label="Ad və soyad">
            <Input name="full_name" defaultValue={name ?? ""} placeholder="Məs. Məmmədov Əli" required autoFocus />
          </Field>
          <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
        </form>
      )}
    </Modal>
  );
}
