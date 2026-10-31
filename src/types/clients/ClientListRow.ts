// Siyahı sətri: şirkət/market + filial (mağaza) sayı
export type ClientListRow = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  contact_person: string | null;
  stores: { count: number }[];
};
