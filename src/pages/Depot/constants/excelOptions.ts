import { AlertTriangle, Boxes, Package, Users, Wrench } from "lucide-react";
import type { Tone, ReportKind } from "@/types/depot";

export const OPTIONS: { id: ReportKind; icon: typeof Wrench; tone: Tone; title: string; sub: string }[] = [
  { id: "all", icon: Boxes, tone: "green", title: "Tam depo", sub: "Xülasə, alətlər, materiallar, ustalar, silinənlər, təmir — hamısı bir faylda" },
  { id: "tools", icon: Wrench, tone: "blue", title: "Yalnız alətlər", sub: "Cəmi, depoda, ustalarda, təmirdə, kimdədir" },
  { id: "materials", icon: Package, tone: "teal", title: "Yalnız materiallar", sub: "Vahid, depoda, parça/açıq balon, ustalarda" },
  { id: "people", icon: Users, tone: "violet", title: "Ustalar", sub: "Bütün ustalar və ya bir usta: üzərindəkilər" },
  { id: "losses", icon: AlertTriangle, tone: "red", title: "Silinənlər", sub: "Xarab, itib, oğurlanıb, sərf — səbəbi, izahı, kim" },
  { id: "repairs", icon: Wrench, tone: "amber", title: "Təmir", sub: "Təmirdə olanlar və təmir tarixçəsi" },
];
