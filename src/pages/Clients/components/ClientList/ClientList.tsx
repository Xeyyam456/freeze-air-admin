import type { ClientListProps } from "@/types/clients";
import { useClientList } from "../../hooks/useClientList";
import { ClientCard } from "./ClientCard";
import { ClientsToolbar } from "./ClientsToolbar";
import { ClientTable } from "./ClientTable";
import { EmptyClients } from "./EmptyClients";
import { Card } from "@/shared/components/Card";

// Şirkətlərin və ya market şəbəkələrinin siyahısı: axtarış + "Kart / Cədvəl" görünüşü
export function ClientList({ kind, emptyHint }: ClientListProps) {
  const { clients, shown, query, setQuery, view, setView } = useClientList(kind);

  if (clients === null) return <Card className="muted">Yüklənir...</Card>;
  if (!clients.length) return <EmptyClients kind={kind} hint={emptyHint} />;

  return (
    <div className="space-y-4">
      <ClientsToolbar query={query} onQuery={setQuery} shown={shown.length} total={clients.length} view={view} onView={setView} />

      {!shown.length ? (
        <Card className="muted py-10 text-center text-sm">“{query}” üzrə heç nə tapılmadı</Card>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 min-[1500px]:grid-cols-3 2xl:grid-cols-[repeat(auto-fill,minmax(420px,1fr))]">
          {shown.map((c) => <ClientCard key={c.id} client={c} kind={kind} />)}
        </div>
      ) : (
        <ClientTable clients={shown} kind={kind} />
      )}
    </div>
  );
}
