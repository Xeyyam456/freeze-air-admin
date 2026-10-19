import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, ChevronRight, LayoutGrid, List, Phone, Search, Store, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import { KIND, type Kind } from "@/lib/kinds";
import { usePref } from "@/lib/usePref";
import { urlQuery } from "@/lib/urlQuery";
import { norm } from "@/components/work/PlacePicker";

// Kartdakı alt yazı: filial sayı, filialı olmayan şirkətdə isə ünvanı
function unitLabel(kind: Kind, count: number, address: string | null) {
  if (kind === "company" && count === 0) return address ?? "Sabit məkan, ünvan yazılmayıb";
  return `${count} ${KIND[kind].unit}`;
}

// Şirkətlərin və ya market şəbəkələrinin siyahısı: axtarış + "Kart / Cədvəl" görünüşü
export function ClientList({ kind, emptyHint }: { kind: Kind; emptyHint: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(urlQuery);
  const [view, setView] = usePref<"cards" | "table">("clients-view", "cards");
  const clients = useData(async () => {
    const { data } = await createClient()
      .from("companies")
      .select("id, name, phone, address, contact_person, stores(count)")
      .eq("kind", kind)
      .order("name");
    return data ?? [];
  }, [kind]);

  const k = KIND[kind];
  const Icon = kind === "market" ? Store : Building2;

  if (clients === null) return <div className="card muted">Yüklənir...</div>;

  if (!clients.length) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Icon size={20} /></span>
        <p className="mt-3 font-semibold">Hələ {k.one} yoxdur</p>
        <p className="muted text-sm">{emptyHint}</p>
      </div>
    );
  }

  const q = norm(query).trim();
  const shown = q
    ? clients.filter((c) => norm([c.name, c.phone, c.address, c.contact_person].filter(Boolean).join(" ")).includes(q))
    : clients;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="search-box flex-1">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad, telefon, ünvan və ya əlaqəli şəxs" />
        </label>
        <span className="muted shrink-0 text-sm">{shown.length} / {clients.length}</span>
        <div className="seg" role="tablist" aria-label="Görünüş">
          <button type="button" role="tab" aria-selected={view === "cards"} onClick={() => setView("cards")} title="Kart">
            <LayoutGrid size={16} />
          </button>
          <button type="button" role="tab" aria-selected={view === "table"} onClick={() => setView("table")} title="Cədvəl">
            <List size={16} />
          </button>
        </div>
      </div>

      {!shown.length ? (
        <div className="card muted py-10 text-center text-sm">“{query}” üzrə heç nə tapılmadı</div>
      ) : view === "cards" ? (
        <div className="grid grid-cols-2 gap-4 min-[1500px]:grid-cols-3">
          {shown.map((c) => (
            <Link key={c.id} to={`${k.route}/${c.id}`} className="card card-link flex items-center gap-4">
              <span className="icon-tile text-lg font-extrabold">{c.name.charAt(0)}</span>
              <div className="min-w-0 flex-1">
                <h3 className="card-title truncate">{c.name}</h3>
                <p className="muted truncate text-sm">{unitLabel(kind, c.stores[0]?.count ?? 0, c.address)}</p>
                {(c.phone || c.contact_person) && (
                  <p className="muted mt-0.5 flex items-center gap-3 text-xs">
                    {c.phone && <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                    {c.contact_person && <span className="flex min-w-0 items-center gap-1 truncate"><User size={12} />{c.contact_person}</span>}
                  </p>
                )}
              </div>
              <ChevronRight size={18} className="muted" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>{kind === "market" ? "Mağaza" : "Filial / ünvan"}</th>
                <th>Telefon</th>
                <th>Əlaqəli şəxs</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id} onClick={() => navigate(`${k.route}/${c.id}`)}>
                  <td className="font-semibold">
                    <span className="flex items-center gap-3">
                      <span className="icon-tile !h-8 !w-8 text-sm font-extrabold">{c.name.charAt(0)}</span>
                      {c.name}
                    </span>
                  </td>
                  <td className="muted">{unitLabel(kind, c.stores[0]?.count ?? 0, c.address)}</td>
                  <td className="muted whitespace-nowrap">{c.phone ?? "—"}</td>
                  <td className="muted">{c.contact_person ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
