import { useNavigate } from "react-router";
import { KIND } from "@/lib/kinds";
import type { ClientTableProps } from "@/types/clients";
import { unitLabel } from "../../utils/unitLabel";

// Cədvəl görünüşü; mobildə hər sətir iki sütunlu kiçik karta çevrilir
export function ClientTable({ clients, kind }: ClientTableProps) {
  const navigate = useNavigate();
  return (
    <div className="card overflow-hidden !p-0">
      <table className="data-table max-sm:block">
        <thead className="max-sm:hidden">
          <tr>
            <th>Ad</th>
            <th className="max-md:hidden">{kind === "market" ? "Mağaza" : "Filial / ünvan"}</th>
            <th>Telefon</th>
            <th>Əlaqəli şəxs</th>
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {clients.map((c) => {
            const label = unitLabel(kind, c.stores[0]?.count ?? 0, c.address);
            return (
              <tr key={c.id} onClick={() => navigate(`${KIND[kind].route}/${c.id}`)} className="max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-0.5 max-sm:border-t max-sm:border-line max-sm:px-3 max-sm:py-2 max-sm:first:border-t-0">
                <td className="font-semibold whitespace-nowrap max-sm:col-span-2 max-sm:!border-0 max-sm:!p-0 max-sm:text-[13px]">
                  <span className="flex items-center gap-3 max-sm:gap-2">
                    <span className="icon-tile !h-8 !w-8 text-sm font-extrabold max-sm:!h-6 max-sm:!w-6 max-sm:!text-[11px]">{c.name.charAt(0)}</span>
                    {c.name}
                  </span>
                </td>
                <td className="muted max-w-[11rem] truncate max-md:hidden max-sm:col-span-2 max-sm:!block max-sm:max-w-none max-sm:!border-0 max-sm:!p-0 max-sm:text-[12px] xl:max-w-[16rem]" title={label}>{label}</td>
                <td className="muted whitespace-nowrap max-sm:!border-0 max-sm:!p-0 max-sm:text-[12px]">{c.phone ?? "—"}</td>
                <td className="muted whitespace-nowrap max-sm:min-w-0 max-sm:truncate max-sm:!border-0 max-sm:!p-0 max-sm:text-right max-sm:text-[12px]">{c.contact_person ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
