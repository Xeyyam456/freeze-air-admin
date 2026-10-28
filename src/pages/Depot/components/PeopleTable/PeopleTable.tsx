import type { DepotBoardState } from "@/types/depot";
import { PersonRow } from "../PersonRow";

// Ustalar cədvəli (sütun başlıqları sürüşmədə yapışıq); sətrə basanda ustanın pəncərəsi
export function PeopleTable({ b }: { b: DepotBoardState }) {
  if (b.people.length === 0) return <p className="muted border-t border-line py-10 text-center text-sm">Heç kim tapılmadı.</p>;
  return (
    <table className="w-full border-t border-line text-sm">
      <thead className="sticky top-[var(--header-h)] z-10 bg-[#f8fafc] text-left text-xs font-semibold text-muted">
        <tr>
          <th className="py-3 pl-5 pr-3 max-sm:pl-3">Usta</th>
          <th className="w-44 px-3 py-3 max-sm:hidden">Alətlər</th>
          <th className="w-44 px-3 py-3 max-sm:hidden">Materiallar</th>
          <th className="w-44 px-3 py-3 max-md:hidden">Vəziyyət</th>
          <th className="w-12 py-3 pl-3 pr-5 max-sm:pr-3" />
        </tr>
      </thead>
      <tbody>
        {b.people.map((e) => (
          <PersonRow key={e.id} emp={e} holds={b.byEmployee[e.id] ?? []} toolInfo={b.toolInfo} onOpen={(k) => b.setPerson({ id: e.id, kind: k })} />
        ))}
      </tbody>
    </table>
  );
}
