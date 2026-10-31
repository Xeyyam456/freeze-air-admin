import type { AccountSectionProps } from "@/types/employees";
import { AccountActive } from "./AccountActive";
import { AccountBox } from "./AccountBox";
import { AccountCreate } from "./AccountCreate";

const DEFAULT_NOTE = "Hesab açılanda usta mobil tətbiqdən öz işlərini əlavə edə biləcək.";

// Ustanın giriş hesabı (yalnız admin görür): hesab aç, parolu dəyiş, hesabı sil
export function AccountSection({ employeeId, email, hasAccount, enabled, note = DEFAULT_NOTE }: AccountSectionProps) {
  if (!enabled) {
    return (
      <AccountBox>
        <p className="muted mt-1 text-xs">
          Hesab funksiyası hələ qoşulmayıb: <code>web/.env.local</code> faylına <code>SUPABASE_SECRET_KEY</code> əlavə et və serveri yenidən başlat.
        </p>
      </AccountBox>
    );
  }
  if (hasAccount) return <AccountActive employeeId={employeeId} email={email} />;
  return <AccountCreate employeeId={employeeId} note={note} />;
}
