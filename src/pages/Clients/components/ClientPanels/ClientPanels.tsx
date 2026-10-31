import { asKind } from "@/lib/kinds";
import type { ClientPanelProps } from "@/types/clients";
import { ClientInfoCard } from "../ClientInfoCard";
import { StoreTools } from "../StoreTools";

// Dar ekranda panel ikiyə bölünür: məlumat kartı səhifənin üstündə, filial/mağaza alətləri üzən düymə ilə
export function ClientInfo({ company, unitCount, admin }: ClientPanelProps) {
  return <ClientInfoCard company={company} kind={asKind(company.kind)} unitCount={unitCount} admin={admin} />;
}

export function ClientTools({ company, unitCount, admin }: ClientPanelProps) {
  const kind = asKind(company.kind);
  return admin && !(kind === "company" && unitCount === 0) ? <StoreTools companyId={company.id} kind={kind} /> : null;
}

// Sağ panel: şirkət/market məlumatı + filial/mağaza alətləri
export function ClientAside({ company, unitCount, admin }: ClientPanelProps) {
  const kind = asKind(company.kind);
  // Sabit məkanlı şirkətdə (filialı yoxdur) filial bölməsi göstərilmir.
  const fixedPlace = kind === "company" && unitCount === 0;

  return (
    <>
      <ClientInfoCard company={company} kind={kind} unitCount={unitCount} admin={admin} />
      {admin && !fixedPlace && <StoreTools companyId={company.id} kind={kind} />}
    </>
  );
}
