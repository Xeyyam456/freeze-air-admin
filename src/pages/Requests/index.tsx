import { Page } from "@/components/Page";
import { EmptyRequests } from "./components/EmptyRequests";
import { RequestDetail } from "./components/RequestDetail";
import { RequestFilters } from "./components/RequestFilters";
import { RequestList } from "./components/RequestList";
import { useRequestsPage } from "./hooks/useRequestsPage";

// Saytın "Bizə yazın" formasından gələn müraciətlər: solda siyahı, sağda seçilmiş müraciət
export default function RequestsPage() {
  const p = useRequestsPage();

  return (
    <Page title="Müraciətlər" subtitle="Saytdakı “Bizə yazın” formasından gələn mesajlar">
      {!p.loaded ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <div className="space-y-4">
          <RequestFilters filter={p.filter} onFilter={p.setFilter} counts={p.counts} query={p.query} onQuery={p.setQuery} />
          {p.list.length === 0 ? (
            <EmptyRequests searching={p.searching} filter={p.filter} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(340px,420px)_1fr]">
              <RequestList list={p.list} selectedId={p.selected?.id} onSelect={p.setSelectedId} />
              {p.selected && <RequestDetail key={p.selected.id} r={p.selected} />}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
