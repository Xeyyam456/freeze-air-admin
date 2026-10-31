import type { Kind } from "@/types/clients";

export const KIND = {
  company: {
    route: "/sirketler",
    section: "Şirkətlər",
    one: "şirkət",
    One: "Şirkət",
    unit: "filial",       // şirkətin filialı: bank filialı, stadion, ofis
    Unit: "Filial",
    unitAcc: "filialı",   // təsirlik hal: "filialı sil"
    UnitAcc: "Filialı",
    namePlaceholder: "Rabitəbank",
    unitPlaceholder: "Yasamal filialı",
  },
  market: {
    route: "/magazalar",
    section: "Mağazalar",
    one: "market",
    One: "Market",
    unit: "mağaza",
    Unit: "Mağaza",
    unitAcc: "mağazanı",
    UnitAcc: "Mağazanı",
    namePlaceholder: "Oba Market",
    unitPlaceholder: "Nərimanov filialı",
  },
} as const;

export function asKind(v: string | null | undefined): Kind {
  return v === "market" ? "market" : "company";
}
