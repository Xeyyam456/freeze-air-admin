import { Navigate } from "react-router";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { useAuth } from "@/auth/AuthProvider";
import { asKind, KIND } from "@/lib/kinds";
import type { ClientDetailProps } from "@/types/clients";
import { useClientDetail } from "../../queries/useClientDetail";
import { ClientAside, ClientInfo, ClientTools } from "../ClientPanels";
import { LocationLogButton } from "../LocationLog";
import { UnitList } from "../UnitList";
import { LocationView } from "./LocationView";
import { Card } from "@/shared/components/Card";

// Şirkətin filialları və ya marketin mağazaları
export function ClientDetail({ id, kind }: ClientDetailProps) {
  const { admin } = useAuth();
  const data = useClientDetail(id);

  if (!data) return <Page title="Yüklənir..."><Card className="muted">Yüklənir...</Card></Page>;
  const { client, units } = data;

  if (!client) {
    return (
      <Page title="Tapılmadı" back={{ href: KIND[kind].route, label: KIND[kind].section }}>
        <Card className="muted">Bu {KIND[kind].one} tapılmadı və ya silinib.</Card>
      </Page>
    );
  }
  // Market şirkətlər bölməsindən açılıbsa (və ya əksinə), düzgün bölməyə yönləndir.
  const realKind = asKind(client.kind);
  if (realKind !== kind) return <Navigate to={`${KIND[realKind].route}/${id}`} replace />;

  const k = KIND[kind];
  const fixedPlace = kind === "company" && units.length === 0;
  const panel = { company: client, unitCount: units.length, admin };

  return (
    <Page
      title={client.name}
      subtitle={fixedPlace ? (client.address ?? "Sabit məkan") : `${units.length} ${k.unit}`}
      back={{ href: k.route, label: k.section }}
      actions={<LocationLogButton companyId={client.id} units={units} />}
    >
      <WithSidePanel fill={fixedPlace} stack={!fixedPlace} inline={fixedPlace}
        narrowTop={fixedPlace ? undefined : <ClientInfo key={client.id} {...panel} />}
        narrowPanel={fixedPlace ? undefined : <ClientTools key={client.id} {...panel} />}
        fabLabel="Filial / mağaza əlavə et"
        panel={<ClientAside key={client.id} {...panel} />}>
        {fixedPlace ? <LocationView company={client} /> : <UnitList units={units} kind={kind} admin={admin} />}
      </WithSidePanel>
    </Page>
  );
}
