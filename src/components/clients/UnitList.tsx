
import { useMemo, useState } from "react";
import { Building2, Search, Store } from "lucide-react";
import { StoreCard } from "@/components/StoreCard";
import { StoreAdminCard } from "@/components/stores/StoreForms";
import type { Tables } from "@/lib/database.types";
import { KIND, type Kind } from "@/lib/kinds";

// Axtarış üçün sadələşdirmə: "Nərimanov" və "nerimanov" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Şirkətin filialları və ya marketin mağazaları: axtarış + kartlar
export function UnitList({ units, kind, admin }: { units: Tables<"stores">[]; kind: Kind; admin: boolean }) {
  const [query, setQuery] = useState("");
  const k = KIND[kind];
  const Icon = kind === "market" ? Store : Building2;

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return units.filter((u) => {
      const haystack = norm(`${u.code} ${u.name} ${u.address} ${u.phone}`);
      return words.every((w) => haystack.includes(w));
    });
  }, [units, query]);

  if (units.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Icon size={20} /></span>
        <p className="mt-3 font-semibold">Hələ {k.unit} yoxdur</p>
        <p className="muted text-sm">Sağdakı formdan tək-tək və ya Excel faylı ilə toplu əlavə et.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Axtarış konteynerin yuxarısında sabit qalır */}
      <div className="search sticky top-0 z-10 rounded-[14px] shadow-[0_0_0_16px_#f8f9fc]">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${k.Unit} kodu, adı və ya ünvanı ilə axtar...`}
          aria-label={`${k.Unit} axtarışı`}
        />
      </div>

      {query && (
        <p className="muted text-sm font-medium">
          {filtered.length} {k.unit} tapıldı / cəmi {units.length}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun {k.unit} tapılmadı.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((u) =>
            admin ? <StoreAdminCard key={u.id} store={u} kind={kind} /> : <StoreCard key={u.id} store={u} />,
          )}
        </div>
      )}
    </div>
  );
}
