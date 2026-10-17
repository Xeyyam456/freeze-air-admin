import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { AddErrorCodeCard, ErrorCodeList } from "@/components/errors/ErrorCodeForms";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

async function fetchCodes() {
  const { data } = await createClient().from("ac_error_codes").select("*").order("model_series", { nullsFirst: false }).order("code");
  return data ?? [];
}

// Xəta kodları: admin idarə edir (model, kod, açıqlama, edilecək iş); Excel-dən toplu yükləmək olar. Ustalar usta panelində baxır.
export default function ErrorCodesPage() {
  const { admin } = useAuth();
  const codes = useData(fetchCodes);
  const models = [...new Set((codes ?? []).map((c) => c.model_series).filter((m): m is string => !!m))].sort((a, b) => a.localeCompare(b, "az"));

  return (
    <Page title="Xəta kodları" subtitle="Kondisioner modeli, xəta kodu, açıqlama və edilecək iş">
      {codes === null ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <WithSidePanel stack panel={admin ? <AddErrorCodeCard models={models} /> : null}>
          <ErrorCodeList codes={codes} models={models} />
        </WithSidePanel>
      )}
    </Page>
  );
}
