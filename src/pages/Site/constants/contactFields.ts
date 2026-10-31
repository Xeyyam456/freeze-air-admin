import { Clock, Link2, Mail, MapPin, Phone } from "lucide-react";
import type { ContactFieldDef } from "@/types/site";

export const CONTACT_FIELDS: ContactFieldDef[] = [
  { name: "phone", label: "Telefon", icon: Phone, placeholder: "+994 12 000 00 00", max: 40, type: "tel" },
  { name: "email", label: "E-poçt", icon: Mail, placeholder: "info@sirket.az", max: 120, type: "email" },
  { name: "address", label: "Ünvan", icon: MapPin, placeholder: "Bakı, Nərimanov r., ...", max: 200, type: "text", wide: true },
  { name: "hours", label: "İş saatları", icon: Clock, placeholder: "B.e.–Şənbə 09:00–19:00", max: 120, type: "text", wide: true },
  { name: "instagram_url", label: "Instagram (istəyə görə)", icon: Link2, placeholder: "https://instagram.com/sirket", max: 200, type: "url" },
  { name: "facebook_url", label: "Facebook (istəyə görə)", icon: Link2, placeholder: "https://facebook.com/sirket", max: 200, type: "url" },
];

// Saytda boş sahənin yerinə görünən yer tutucular (web ilə eyni)
export const CONTACT_FALLBACK = { phone: "+994 XX XXX XX XX", address: "Bakı, ünvan yazılacaq", hours: "Hər gün, saatlar yazılacaq" };

// Əlaqə məlumatlarının saytda göründüyü yerlər
export const CONTACT_PLACES = ["Footer (bütün səhifələr; sosial linklər yalnız footer-də)", "Ana səhifə: sürətli əlaqə və xəritə", "Əlaqə səhifəsi", "Xidmət səhifələri: zəng bloku"];
