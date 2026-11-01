import type { LucideIcon } from "lucide-react";

export type WithSidePanelProps = {
  panel: React.ReactNode | null;
  fill?: boolean;
  stack?: boolean; // üst hissə (axtarış, tablar) yerində qalır, məzmun öz bloku içində sürüşür: uşaq `flex h-full flex-col` olmalıdır
  fabLabel?: string; // dar ekranda üzən düymənin yazısı və ikonu
  fabIcon?: LucideIcon;
  narrowTop?: React.ReactNode; // dar ekranda məzmunun ÜSTÜNDƏ adi kart kimi görünən hissə (məs. məlumat kartı); panel isə yalnız narrowPanel olur
  narrowPanel?: React.ReactNode;
  inline?: boolean; // dar ekranda panel üzən düymə əvəzinə məzmunun ÜSTÜNDƏ adi kart kimi görünür (yalnız məlumat kartı olan səhifələr)
  children: React.ReactNode;
};
