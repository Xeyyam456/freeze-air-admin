import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { AddEmployeeButton } from "./components/AddEmployeeButton";
import { EmployeeList } from "./components/EmployeeList";
import { useEmployeesData } from "./queries/useEmployeesData";
import { Card } from "@/shared/components/Card";

export default function EmployeesPage() {
  const { admin } = useAuth();
  const data = useEmployeesData(admin);

  return (
    <Page title="Ustalar" subtitle="Ustaların ixtisası, təcrübəsi və əlaqə məlumatı" actions={admin ? <AddEmployeeButton /> : undefined}>
      {!data ? (
        <Card className="muted">Yüklənir...</Card>
      ) : (
        <EmployeeList
          employees={data.employees}
          todayWork={data.todayWork}
          monthWork={data.monthWork}
          status={data.status}
          partners={data.partners}
          accounts={{ enabled: data.emails !== null, emails: data.emails ?? {} }}
          admin={admin}
        />
      )}
    </Page>
  );
}
