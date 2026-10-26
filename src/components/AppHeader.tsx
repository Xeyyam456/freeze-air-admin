import { useState } from "react";
import { Menu } from "lucide-react";
import { useNavDrawer } from "@/lib/navDrawer";
import { useAuth } from "@/auth/AuthProvider";
import { initials } from "@/lib/experience";
import { LogoutButton } from "./LogoutButton";
import { ProfileModal } from "./ProfileModal";

// Sağ yuxarıdakı profil: ad və vəzifə. Klik profil pəncərəsini açır (ad yazılmayıbsa, orada yazılır).
function UserChip() {
  const { email: rawEmail, admin, name: fullName, position, photoUrl } = useAuth();
  const email = rawEmail ?? "";
  const [editing, setEditing] = useState(false);
  const name = fullName ?? (admin ? "Admin" : email);
  const role = admin ? (position ?? "Administrator") : fullName ? "Usta" : "İstifadəçi";

  return (
    <div className="user-chip !pl-1">
      {editing && <ProfileModal onClose={() => setEditing(false)} />}
      <button type="button" onClick={() => setEditing(true)} title={`${email} — profili aç`}
        className="flex items-center gap-2.5 rounded-full py-0.5 pl-3 pr-0.5 hover:bg-white/10">
        <span className="text-right leading-tight max-[1300px]:hidden">
          <span className="block font-semibold text-white">{name}</span>
          <span className="block text-[11px] text-white/60">{role}</span>
        </span>
        {photoUrl
          ? <img src={photoUrl} alt="" className="avatar object-cover" />
          : <span className="avatar">{initials(name)}</span>}
      </button>
      <LogoutButton />
    </div>
  );
}

// Səhifənin yuxarı zolağı (bir sətir): solda başlıq, sağda səhifənin əməliyyatları və profil
export function AppHeader({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  const { setOpen } = useNavDrawer();
  return (
    <header className="app-header">
      <div className="app-shell relative flex w-full items-center gap-4">
        <button type="button" onClick={() => setOpen(true)} className="nav-burger" aria-label="Menyunu aç"><Menu size={20} /></button>
        <div className="min-w-0 flex-1">{children}</div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        <UserChip />
      </div>
    </header>
  );
}
