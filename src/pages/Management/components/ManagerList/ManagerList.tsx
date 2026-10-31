import { SearchBar } from "@/shared/components/SearchBar";
import type { Employee } from "@/types/employees";
import type { ManagerCardProps, ManagerListProps } from "@/types/management";
import { useManagerFilter } from "../../hooks/useManagerFilter";
import { EmptyManagers } from "./EmptyManagers";
import { ManagerGroups } from "./ManagerGroups";
import { Card } from "@/shared/components/Card";

export function ManagerList({ managers, accounts, canEdit, canContact = false, myUserId }: ManagerListProps) {
  const { query, setQuery, filtered } = useManagerFilter(managers);

  if (managers.length === 0) return <EmptyManagers canEdit={canEdit} />;

  const cardOf = (m: Employee): ManagerCardProps => ({
    manager: m, accounts, isMe: m.user_id === myUserId, canEdit: canEdit && m.user_id !== myUserId, canContact,
  });

  return (
    <div className="space-y-5">
      <SearchBar value={query} onChange={setQuery} placeholder="Ad, vəzifə və ya telefon ilə axtar..." label="Rəhbər axtarışı" />

      {filtered.length === 0
        ? <Card className="muted py-10 text-center text-sm">Bu axtarışa uyğun rəhbər tapılmadı.</Card>
        : <ManagerGroups filtered={filtered} cardOf={cardOf} />}
    </div>
  );
}
