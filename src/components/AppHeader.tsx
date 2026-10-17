import { useState } from "react";
import { Link } from "react-router";
import { Snowflake } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { initials } from "@/lib/experience";
import { LogoutButton } from "./LogoutButton";
import { ProfileModal } from "./ProfileModal";
import { NavLinks } from "./NavLinks";

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
        <span className="text-right leading-tight max-[1100px]:hidden">
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

export function AppHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-sticky">
      <div className="app-topbar">
        <div className="app-shell flex h-[var(--topbar-h)] items-center gap-6 2xl:gap-10">
          <Link to="/" className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold">Freeze Air Service</span>
              <span className="block text-xs text-white/60">İdarəetmə paneli</span>
            </span>
          </Link>
          <NavLinks />
          <div className="ml-auto">
            <UserChip />
          </div>
        </div>
      </div>
      <header className="app-header">
        <div className="app-shell relative w-full">{children}</div>
      </header>
    </div>
  );
}
