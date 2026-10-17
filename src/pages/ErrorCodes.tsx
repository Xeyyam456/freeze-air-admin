import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { ErrorCodeList, ErrorCodePanel } from "@/components/errors/ErrorCodeForms";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchAll() {
  const supabase = createClient();
  const [models, codes] = await Promise.all([
    supabase.from("ac_models").select("id, name").order("name").then((r) => r.data ?? []),
    supabase.from("ac_error_codes").select("id, model_id, code, title, solution").order("code").then((r) => r.data ?? []),
  ]);
  return { models: models.sort((a, b) => a.name.localeCompare(b.name, "az")), codes };
}

// Xəta kodları: admin idarə edir. Əvvəl kondisioner modelləri əlavə olunur, sonra model seçilib kod, açıqlama və edilecək iş yazılır;
// Excel-dən toplu yükləmək olar. Ustalar usta panelində modeli dropdown-dan seçib baxır.
export default function ErrorCodesPage() {
  const { admin } = useAuth();
  const data = useData(fetchAll);

  return (
    <Page title="Xəta kodları" subtitle="Əvvəl model əlavə et, sonra modeli seçib xəta kodu yaz">
      {data === null ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <WithSidePanel stack panel={admin ? <ErrorCodePanel models={data.models} codes={data.codes} /> : null}>
          <ErrorCodeList codes={data.codes} models={data.models} />
        </WithSidePanel>
      )}
    </Page>
  );
}
