import { Page } from "@/components/Page";
import { useAuth } from "@/auth/AuthProvider";
import type { ClientsPageProps } from "@/types/clients";
import { AddClientButton } from "./components/AddClientButton";
import { ClientList } from "./components/ClientList";
import { TEXT } from "./constants/texts";

export function ClientsPage({ kind }: ClientsPageProps) {
  const { admin } = useAuth();
  const t = TEXT[kind];
  return (
    <Page title={t.title} subtitle={t.subtitle} actions={admin ? <AddClientButton kind={kind} /> : undefined}>
      <ClientList kind={kind} emptyHint={t.empty} />
    </Page>
  );
}
