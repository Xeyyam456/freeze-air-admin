import { Navigate } from "react-router";
import { MapPin } from "lucide-react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import type { Tables } from "@/lib/database.types";
import { useAuth } from "@/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { asKind, KIND, type Kind } from "@/lib/kinds";
import { mapEmbedUrl } from "@/lib/navigation";
import { ClientAside, ClientInfo, ClientTools } from "./ClientForms";
import { LocationLogButton } from "./LocationLog";
import { UnitList } from "./UnitList";

// Filialı olmayan (sabit məkanlı) şirkət: siyahı əvəzinə yeri böyük xəritədə
function LocationView({ company }: { company: Tables<"companies"> }) {
  const hasLocation = (company.lat != null && company.lng != null) || !!company.address;

  if (!hasLocation) {
    return (
      <div className="card flex h-full flex-col items-center justify-center text-center">
        <span className="icon-tile"><MapPin size={20} /></span>
        <p className="mt-3 font-semibold">Ünvan yazılmayıb</p>
        <p className="muted text-sm">Sağ paneldəki redaktə düyməsi ilə şirkətin ünvanını və koordinatını daxil et.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-line bg-surface">
      <iframe
        src={mapEmbedUrl(company)}
        title={`${company.name} xəritədə`}
        className="block h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

// Şirkətin filialları və ya marketin mağazaları
export function ClientDetail({ id, kind }: { id: number; kind: Kind }) {
  const { admin } = useAuth();
  const data = useData("client-detail", async () => {
    const supabase = createClient();
    const [{ data: client }, { data: units }] = await Promise.all([
      supabase.from("companies").select("*").eq("id", id).maybeSingle(),
      supabase.from("stores").select("*").eq("company_id", id).order("code"),
    ]);
    return { client, units: units ?? [] };
  }, [id]);

  if (!data) return <Page title="Yüklənir..."><div className="card muted">Yüklənir...</div></Page>;
  const { client, units } = data;

  if (!client) {
    return (
      <Page title="Tapılmadı" back={{ href: KIND[kind].route, label: KIND[kind].section }}>
        <div className="card muted">Bu {KIND[kind].one} tapılmadı və ya silinib.</div>
      </Page>
    );
  }
  // Market şirkətlər bölməsindən açılıbsa (və ya əksinə), düzgün bölməyə yönləndir.
  const realKind = asKind(client.kind);
  if (realKind !== kind) return <Navigate to={`${KIND[realKind].route}/${id}`} replace />;

  const k = KIND[kind];
  const list = units;
  const fixedPlace = kind === "company" && list.length === 0;

  return (
    <Page
      title={client.name}
      subtitle={fixedPlace ? (client.address ?? "Sabit məkan") : `${list.length} ${k.unit}`}
      back={{ href: k.route, label: k.section }}
      actions={<LocationLogButton companyId={client.id} units={list} />}
    >
      <WithSidePanel fill={fixedPlace} stack={!fixedPlace} inline={fixedPlace}
        narrowTop={fixedPlace ? undefined : <ClientInfo key={client.id} company={client} unitCount={list.length} admin={admin} />}
        narrowPanel={fixedPlace ? undefined : <ClientTools key={client.id} company={client} unitCount={list.length} admin={admin} />}
        fabLabel="Filial / mağaza əlavə et"
        panel={<ClientAside key={client.id} company={client} unitCount={list.length} admin={admin} />}>
        {fixedPlace ? <LocationView company={client} /> : <UnitList units={list} kind={kind} admin={admin} />}
      </WithSidePanel>
    </Page>
  );
}
