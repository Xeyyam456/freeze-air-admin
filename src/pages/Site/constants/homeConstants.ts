import type { CardColor, QuickField, QuickKey } from "@/types/site";

export const SITE_DELAY = "Saytda ən gec 1 dəqiqəyə görünəcək.";

// "Haqqımızda" kartının rəngləri (saytın palitrası: web/src/app/globals.css və web page.tsx CARD_COLORS)
export const CARD_COLORS: CardColor[] = [
  { id: "night", label: "Tünd", bg: "#06192b", fg: "#ffffff", icon: "#00a3d9", sub: "rgba(255,255,255,0.6)" },
  { id: "cold", label: "Göy", bg: "#00a3d9", fg: "#ffffff", icon: "#ffffff", sub: "rgba(255,255,255,0.75)" },
  { id: "ice", label: "Açıq mavi", bg: "#cfe8f3", fg: "#06192b", icon: "#00a3d9", sub: "rgba(6,25,43,0.6)" },
  { id: "white", label: "Ağ", bg: "#ffffff", fg: "#06192b", icon: "#00a3d9", sub: "rgba(6,25,43,0.6)" },
];

// Hero-dakı sürətli müraciət formunun standart mətnləri (web/src/lib/site-texts.ts ilə eyni)
export const QUICK_DEFAULTS: Record<QuickKey, string> = {
  "home.quick.name": "Adınız",
  "home.quick.phone": "Telefon nömrəniz",
  "home.quick.button": "Zəng sifariş et",
  "home.quick.note": "Nömrənizi yazın, sizə özümüz zəng edək.",
  "home.quick.or": "Və ya zəng edin",
};

export const QUICK_FIELDS: QuickField[] = [
  { key: "home.quick.name", label: "Ad sahəsinin yazısı", max: 40 },
  { key: "home.quick.phone", label: "Telefon sahəsinin yazısı", max: 40 },
  { key: "home.quick.button", label: "Düymənin yazısı", max: 30 },
  { key: "home.quick.note", label: "Formun altındakı yazı", max: 120 },
  { key: "home.quick.or", label: "Telefon nömrəsinin yanındakı yazı", max: 40 },
];

// Ana səhifə tabının önizləmələrində göstərilən mətnlərin açarları
export const HOME_TEXT_KEYS = ["brand.name", "brand.tagline", "header.cta", "home.hero.title", ...Object.keys(QUICK_DEFAULTS)];
