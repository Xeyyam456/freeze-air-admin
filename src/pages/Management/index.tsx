import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { AddManagerButton } from "./components/AddManagerButton";
import { ManagerList } from "./components/ManagerList";
import { useManagersData } from "./queries/useManagersData";

export default function ManagementPage() {
  const { admin, owner, session } = useAuth();
  const data = useManagersData(admin);

  return (
    <Page title="Rəhbərlik" actions={owner ? <AddManagerButton /> : undefined} subtitle={owner ? "Müdir, servis müdirləri və maliyyəçi: hesabları admin yetkisi alır" : "Rəhbərlərin telefonunu və şəklini dəyişə bilərsən; qalan məlumatları müdir dəyişir"}>
      {!data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        // Rəhbərlik heyətini yalnız sahib (müdir) dəyişir; digər adminlər baxır
        <ManagerList managers={data.managers} canEdit={owner} canContact={admin} myUserId={session?.user.id ?? null}
          accounts={{ enabled: data.emails !== null, emails: data.emails ?? {} }} />
      )}
    </Page>
  );
}
