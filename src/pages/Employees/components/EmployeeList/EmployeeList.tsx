import { SearchBar } from "@/shared/components/SearchBar";
import type { EmployeeListProps } from "@/types/employees";
import { useEmployeeFilter } from "../../hooks/useEmployeeFilter";
import { EmployeeCard } from "../EmployeeCard";
import { EmptyEmployees } from "./EmptyEmployees";

// Ustalar: yapışan axtarış və profil kartları
export function EmployeeList({ employees, todayWork, monthWork, status, partners, accounts, admin }: EmployeeListProps) {
  const { query, setQuery, filtered } = useEmployeeFilter(employees);

  if (employees.length === 0) return <EmptyEmployees admin={admin} />;

  return (
    <div className="space-y-5">
      <SearchBar value={query} onChange={setQuery} placeholder="Ad, ixtisas, növ və ya telefon ilə axtar..." label="Usta axtarışı" />

      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun usta tapılmadı.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {filtered.map((e) => (
            <EmployeeCard key={e.id} employee={e} todayCount={todayWork[e.id] ?? 0} monthCount={monthWork[e.id] ?? 0}
              status={status[e.id]} partners={partners[e.id] ?? []} accounts={accounts} admin={admin} />
          ))}
        </div>
      )}
    </div>
  );
}
