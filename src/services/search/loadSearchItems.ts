import { Building2, Store, User, UserCog, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PaletteItem } from "@/types/layout";

const route = (kind: string | null | undefined) => (kind === "market" ? "/magazalar" : "/sirketler");
const q = (s: string) => `?q=${encodeURIComponent(s)}`;

// Axtarış üçün məlumat yalnız pəncərə ilk dəfə açılanda yüklənir (hər səhifədə sorğu getməsin):
// şirkət/market, filial/mağaza, usta/rəhbər, alət/material
export async function loadSearchItems(): Promise<PaletteItem[]> {
  const supabase = createClient();
  const [companies, stores, employees, tools] = await Promise.all([
    supabase.from("companies").select("id, name, kind").order("name").then((r) => r.data ?? []),
    supabase.from("stores").select("id, name, code, company_id, companies(name, kind)").order("name").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, is_management, specialty, position").eq("is_active", true).order("full_name").then((r) => r.data ?? []),
    supabase.from("tools").select("id, name, kind, inventory_code").order("name").then((r) => r.data ?? []),
  ]);
  return [
    ...companies.map((c) => ({
      key: `c${c.id}`, group: c.kind === "market" ? "Marketlər" : "Şirkətlər", label: c.name,
      icon: c.kind === "market" ? Store : Building2, href: `${route(c.kind)}/${c.id}`,
    })),
    ...stores.map((s) => ({
      key: `s${s.id}`, group: "Filial və mağazalar", label: s.name, hint: [s.code, s.companies?.name].filter(Boolean).join(" · "),
      icon: Store, href: `${route(s.companies?.kind)}/${s.company_id}${q(s.code ?? s.name)}`,
    })),
    ...employees.map((e) => ({
      key: `e${e.id}`, group: e.is_management ? "Rəhbərlik" : "Ustalar", label: e.full_name,
      hint: (e.is_management ? e.position : e.specialty) ?? undefined,
      icon: e.is_management ? UserCog : User, href: `${e.is_management ? "/rehberlik" : "/ustalar"}${q(e.full_name)}`,
    })),
    ...tools.map((t) => ({
      key: `t${t.id}`, group: t.kind === "material" ? "Materiallar" : "Alətlər", label: t.name, hint: t.inventory_code ?? undefined,
      icon: Wrench, href: `/depo${q(t.name)}`,
    })),
  ];
}
