import { useState, useTransition } from "react";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "./ConfirmModal";

// Çıxış: təsadüfi klikdən qorunmaq üçün əvvəlcə təsdiq soruşulur
// menu: telefon siyirtməsindəki "Çıxış" bəndi (başlıqda mobildə gizlədilir ki, səhifə adına yer qalsın)
export function LogoutButton({ menu = false }: { menu?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const navigate = useNavigate();

  return (
    <>
      {menu ? (
        <button type="button" onClick={() => setOpen(true)} className="side-link">
          <LogOut size={18} strokeWidth={2.1} /> <span className="flex-1 text-left">Çıxış</span>
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="grid h-[30px] w-[30px] place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white max-sm:hidden"
          title="Çıxış" aria-label="Çıxış">
          <LogOut size={15} />
        </button>
      )}
      <ConfirmModal
        open={open}
        icon={LogOut}
        title="Çıxmaq istəyirsən?"
        message="Yenidən daxil olmaq üçün e-poçt və parol lazım olacaq."
        confirmLabel="Bəli, çıx"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => startTransition(async () => {
          await createClient().auth.signOut();
          navigate("/login", { replace: true });
        })}
      />
    </>
  );
}
