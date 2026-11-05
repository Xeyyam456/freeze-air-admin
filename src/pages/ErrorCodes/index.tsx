import { useAuth } from "@/auth/AuthProvider";
import { Page } from "@/components/Page";
import { Card } from "@/shared/components/Card";
import { ErrorCodesScreen } from "./components/ErrorCodesScreen";
import { useErrorCodesData } from "./queries/useErrorCodesData";

// Xəta kodları: admin idarə edir. Kod xəritəsində kodu seç və ya boş xanaya klik et — sağdakı pultda yaz.
// Excel-dən toplu yükləmək və modelləri idarə etmək də sağ paneldədir. Ustalar usta panelində baxır.
export default function ErrorCodesPage() {
  const { admin } = useAuth();
  const data = useErrorCodesData();

  return (
    <Page title="Xəta kodları" subtitle="Xəritədə kodu seç və ya boş xanaya klik et, pultda yaz">
      {data === null ? <Card className="muted">Yüklənir...</Card> : <ErrorCodesScreen data={data} admin={admin} />}
    </Page>
  );
}
