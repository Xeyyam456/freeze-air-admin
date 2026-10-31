import { useParams } from "react-router";
import type { ClientsPageProps } from "@/types/clients";
import { ClientDetail } from "./components/ClientDetail";

// Bir şirkət/market səhifəsi; key — başqa şirkətə keçəndə vəziyyət sıfırlansın
export function ClientPage({ kind }: ClientsPageProps) {
  const { id } = useParams();
  return <ClientDetail key={id} id={Number(id)} kind={kind} />;
}
