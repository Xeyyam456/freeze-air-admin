import { useParams } from "react-router";
import { Page } from "@/components/Page";
import { AddClientButton } from "@/components/clients/ClientForms";
import { ClientDetail } from "@/components/clients/ClientDetail";
import { ClientList } from "@/components/clients/ClientList";
import { useAuth } from "@/auth/AuthProvider";
import type { Kind } from "@/lib/kinds";

const TEXT = {
  company: {
    title: "Şirkətlər",
    subtitle: "Müqavilə bağladığımız şirkətlər və onların filialları",
    empty: "Yuxarıdakı “Yeni şirkət” düyməsi ilə ilk şirkəti əlavə et: Rabitəbank, Qarabağ stadionu və s.",
  },
  market: {
    title: "Mağazalar",
    subtitle: "Müqavilə bağladığımız mağazalar və onların filialları",
    empty: "Yuxarıdakı “Yeni market” düyməsi ilə ilk marketi əlavə et: Oba, Araz, ALL və s.",
  },
};

export function ClientsPage({ kind }: { kind: Kind }) {
  const { admin } = useAuth();
  const t = TEXT[kind];
  return (
    <Page title={t.title} subtitle={t.subtitle} actions={admin ? <AddClientButton kind={kind} /> : undefined}>
      <ClientList kind={kind} emptyHint={t.empty} />
    </Page>
  );
}

export function ClientPage({ kind }: { kind: Kind }) {
  const { id } = useParams();
  return <ClientDetail key={id} id={Number(id)} kind={kind} />;
}
