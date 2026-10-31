import type { SiteService } from "./SiteService";

// Xidmət səhifəsinin hissəsi: dolğunluq zolağı və "nə çatışmır" siyahısı üçün
export type ServicePart = { label: string; done: (s: SiteService) => boolean };
