import { useState } from "react";
import { Mail, UserRound, X } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { AvatarUpload } from "@/components/employees/AvatarUpload";
import { Buttons, Field } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Giriş e-poçtunu dəyişmək: Supabase yeni ünvana təsdiq məktubu göndərir (təhlükəsizlik üçün köhnə ünvana da göndərə bilər).
// Linkə basılmayınca e-poçt dəyişmir; admin yetkisi və müdir statusu e-poçta yox, hesabın öz identifikatoruna bağlıdır, ona görə itmir.
function EmailChange() {
  const { email } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase();
    if (!next) return toast.error("Yeni e-poçt vacibdir.");
    if (next === email?.toLowerCase()) return toast.error("Bu artıq hazırkı e-poçtundur.");
    setPending(true);
    const { error } = await createClient().auth.updateUser({ email: next }, { emailRedirectTo: window.location.origin });
    setPending(false);
    if (error) {
      if (/already|registered|exists/i.test(error.message)) return toast.error("Bu e-poçtla hesab artıq var.");
      if (/rate|seconds|too many/i.test(error.message)) return toast.error("Çox tez-tez cəhd edirsən, bir az sonra yenidən yoxla.");
      if (/invalid|valid/i.test(error.message)) return toast.error("E-poçt düzgün deyil.");
      return toast.error(error.message);
    }
    setSentTo(next);
    setOpen(false);
    toast.success("Təsdiq məktubu göndərildi");
  }

  if (sentTo) {
    return (
      <div className="rounded-xl bg-primary-soft px-3 py-2.5 text-sm">
        <p className="flex items-center gap-2 font-semibold text-primary"><Mail size={15} /> Təsdiq məktubu göndərildi</p>
        <p className="mt-1 text-xs text-ink">
          <b>{sentTo}</b> ünvanını yoxla və məktubdakı linkə bas. Təhlükəsizlik üçün köhnə ünvana da məktub gələ bilər: hər ikisindəki linkə bas.
          Təsdiqdən sonra yeni ünvanla daxil ol; yetkilərin dəyişmir.
        </p>
      </div>
    );
  }

  return open ? (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Yeni e-poçt">
        <input name="email" type="email" required autoFocus autoComplete="off" placeholder="yeni@gmail.com" className="field" />
      </Field>
      <p className="muted text-xs">Ünvana təsdiq məktubu gələcək. Linkə basmayınca e-poçt dəyişmir.</p>
      <Buttons pending={pending} label="Təsdiq məktubu göndər" onCancel={() => setOpen(false)} />
    </form>
  ) : (
    <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm"><Mail size={14} /> E-poçtu dəyiş</button>
  );
}

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
        <div className="flex items-center gap-3">
          <span className="icon-tile !h-11 !w-11"><UserRound size={20} /></span>
          <div>
            <h2 id="profile-title" className="text-lg font-bold">Profil</h2>
            <p className="muted text-sm">{email}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
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
            <input name="full_name" defaultValue={name ?? ""} placeholder="Məs. Məmmədov Əli" required autoFocus className="field" />
          </Field>
          <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
        </form>
      )}

      <div className="mt-5 border-t border-line pt-4">
        <EmailChange />
      </div>
    </Modal>
  );
}
