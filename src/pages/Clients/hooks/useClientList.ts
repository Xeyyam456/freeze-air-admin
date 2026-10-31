import { useState } from "react";
import { useMedia } from "@/lib/navDrawer";
import { urlQuery } from "@/lib/urlQuery";
import { usePref } from "@/lib/usePref";
import { norm } from "@/shared/utils/norm";
import type { ClientView } from "@/types/clients";
import { useClientsData } from "../queries/useClientsData";
import type { Kind } from "@/types/clients";

// Siyahının vəziyyəti: axtarış, "Kart / Cədvəl" görünüşü (mobildə həmişə cədvəl), süzülmüş sətirlər
export function useClientList(kind: Kind) {
  const [query, setQuery] = useState(urlQuery);
  const [savedView, setView] = usePref<ClientView>("clients-view", "cards");
  // Mobildə (< 640px) yalnız siyahı: kart/cədvəl keçidi yoxdur
  const phone = useMedia("(width < 640px)");
  const view: ClientView = phone ? "table" : savedView;
  const clients = useClientsData(kind);

  const q = norm(query).trim();
  const shown = !clients ? [] : q
    ? clients.filter((c) => norm([c.name, c.phone, c.address, c.contact_person].filter(Boolean).join(" ")).includes(q))
    : clients;

  return { clients, shown, query, setQuery, view, setView };
}
