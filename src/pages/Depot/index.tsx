import { useState } from "react";
import { Settings2 } from "lucide-react";
import { listAccountEmails } from "@/actions/accounts";
import { useAuth } from "@/auth/AuthProvider";
import { KeeperModal } from "./keeper/KeeperModal";
import { useMedia } from "@/lib/navDrawer";
import { useData } from "@/lib/useData";
import { DepotScreen } from "./components/DepotScreen";
import { DEPOT_KEEPER_EMAILS_KEY } from "./queries/keys";
import { useDepotData } from "./queries/useDepotData";

// Admin depo səhifəsi: ortaq ekran + "Depo məsulu" (yalnız admin; ⚙, < 380px-də "Daha çox" menyusunda).
// Web-də öz index.tsx-i var (sinxron skripti bu faylı köçürmür).
export default function DepotPage() {
  const { admin, owner, canManageTools, employeeId, session } = useAuth();
  const data = useDepotData();
  // Depo məsullarının giriş hesabları (e-poçt): yalnız admin görür, Edge Function verir
  const emails = useData(DEPOT_KEEPER_EMAILS_KEY, () => (admin ? listAccountEmails() : Promise.resolve(null)), [admin]);
  const [keeper, setKeeper] = useState(false);
  const tiny = useMedia("(width < 380px)");
  const showKeeper = canManageTools && admin;

  const gear = showKeeper && !tiny && (
    <button type="button" onClick={() => setKeeper(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20" title="Depo məsulu" aria-label="Depo məsulu">
      <Settings2 size={18} />
    </button>
  );
  return (
    <DepotScreen data={data} canManage={canManageTools} myUid={session?.user.id ?? null} owner={owner} variant="admin"
      extraActions={gear} extraMenu={showKeeper && tiny ? [{ label: "Depo məsulu", icon: Settings2, onClick: () => setKeeper(true) }] : []}>
      {keeper && data && (
        <KeeperModal employees={data.employees} accounts={{ enabled: emails != null, emails: emails ?? {} }} selfId={employeeId} onClose={() => setKeeper(false)} />
      )}
    </DepotScreen>
  );
}
