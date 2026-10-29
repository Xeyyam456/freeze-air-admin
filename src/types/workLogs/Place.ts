// İşin görüldüyü yer: mağaza/filial, filialı olmayan sabit məkanlı şirkət və ya siyahıda olmayan yer (mətn)
export type Place = {
  key: string;
  storeId: number | null;
  companyId: number | null;
  custom: string | null;
  group: string;
  label: string;
  sub: string;
  search: string;
};
