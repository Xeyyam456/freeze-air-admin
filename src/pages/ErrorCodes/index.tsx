import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { ErrorCodeList } from "./components/ErrorCodeList";
import { ErrorCodePanel } from "./components/ErrorCodePanel";
import { useErrorCodesData } from "./queries/useErrorCodesData";

// Xəta kodları: admin idarə edir. Əvvəl kondisioner modelləri əlavə olunur, sonra model seçilib kod, açıqlama və edilecək iş yazılır;
// Excel-dən toplu yükləmək olar. Ustalar usta panelində modeli dropdown-dan seçib baxır.
export default function ErrorCodesPage() {
  const { admin } = useAuth();
  const data = useErrorCodesData();

  return (
    <Page title="Xəta kodları" subtitle="Əvvəl model əlavə et, sonra modeli seçib xəta kodu yaz">
      {data === null ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <WithSidePanel stack fabLabel="Model / kod əlavə et" panel={admin ? <ErrorCodePanel models={data.models} codes={data.codes} /> : null}>
          <ErrorCodeList codes={data.codes} models={data.models} />
        </WithSidePanel>
      )}
    </Page>
  );
}
