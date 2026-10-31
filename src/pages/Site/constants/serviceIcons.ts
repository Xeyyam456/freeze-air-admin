import { Droplets, Fan, Gauge, Refrigerator, ShieldCheck, Snowflake, ThermometerSnowflake, Wind, Wrench, Zap, type LucideIcon } from "lucide-react";
import type { ServiceIconDef, ServicePart } from "@/types/site";

// Saytdakı ikonlarla eyni ad → ikon (bazadakı icon dəyərləri)
export const SERVICE_ICONS: ServiceIconDef[] = [
  { name: "fan", icon: Fan },
  { name: "wrench", icon: Wrench },
  { name: "gauge", icon: Gauge },
  { name: "thermometer", icon: ThermometerSnowflake },
  { name: "wind", icon: Wind },
  { name: "refrigerator", icon: Refrigerator },
  { name: "snowflake", icon: Snowflake },
  { name: "zap", icon: Zap },
  { name: "droplets", icon: Droplets },
  { name: "shield", icon: ShieldCheck },
];

export function serviceIcon(name: string): LucideIcon {
  return SERVICE_ICONS.find((i) => i.name === name)?.icon ?? Wrench;
}

// Xidmət səhifəsinin hissələri: dolğunluq zolağı və "nə çatışmır" siyahısı üçün
export const SERVICE_PARTS: ServicePart[] = [
  { label: "başlıq izahı", done: (s) => !!s.lead },
  { label: "ətraflı mətn", done: (s) => !!s.details },
  { label: "nə daxildir", done: (s) => s.includes.length > 0 },
  { label: "addımlar", done: (s) => s.steps.length > 0 },
  { label: "məsləhət", done: (s) => !!s.note },
  { label: "şəkil", done: (s) => !!s.image_url },
];
