import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { AddManagerCard, ManagerList } from "@/components/management/ManagementForms";
import { listAccountEmails } from "@/actions/accounts";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchManagers(admin: boolean) {
  const [{ data: managers }, emails] = await Promise.all([
    createClient().from("employees").select("*").eq("is_management", true).eq("is_active", true).order("full_name"),
    // Giriş hesablarının e-poçtları: yalnız admin görür, Edge Function verir
    admin ? listAccountEmails() : Promise.resolve(null),
  ]);
  return { managers: managers ?? [], emails };
}

export default function ManagementPage() {
  const { admin, owner, session } = useAuth();
  const data = useData(() => fetchManagers(admin), [admin]);

  return (
    <Page title="Rəhbərlik" subtitle={owner ? "Müdir, servis müdirləri və maliyyəçi: hesabları admin yetkisi alır" : "Rəhbərlik heyətinin məlumatlarını yalnız müdir dəyişə bilər"}>
      {!data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        // Rəhbərlik heyətini yalnız sahib (müdir) dəyişir; digər adminlər baxır
        <WithSidePanel panel={owner ? <AddManagerCard /> : null}>
          <ManagerList managers={data.managers} canEdit={owner} myUserId={session?.user.id ?? null}
            accounts={{ enabled: data.emails !== null, emails: data.emails ?? {} }} />
        </WithSidePanel>
      )}
    </Page>
  );
}
