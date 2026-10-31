import type { TextGroup } from "@/types/site";

export const COMMON_TEXTS: TextGroup = {
  id: "common",
  title: "Ümumi",
  hint: "Bütün səhifələrdə: header, menyu, footer.",
  sections: [
    {
      title: "Brend və header",
      fields: [
        { key: "brand.name", label: "Şirkətin adı (loqo yanında, footer, brauzer tabı)" },
        { key: "brand.tagline", label: "Adın altındakı yazı" },
        { key: "header.cta", label: "Header düyməsi" },
        { key: "header.login", label: "Giriş düyməsi (qonaq)" },
        { key: "header.panel", label: "Panel düyməsi (giriş edən usta)" },
      ],
    },
    {
      title: "Menyu",
      fields: [
        { key: "nav.home", label: "Əsas" },
        { key: "nav.equipment", label: "Avadanlıq" },
        { key: "nav.services", label: "Xidmətlər" },
        { key: "nav.how", label: "Necə işləyirik" },
        { key: "nav.team", label: "Ustalarımız" },
        { key: "nav.contact", label: "Əlaqə" },
      ],
    },
    {
      title: "Footer",
      fields: [
        { key: "footer.text", label: "Loqo altındakı mətn", kind: "text" },
        { key: "footer.login", label: "Usta girişi düyməsi" },
        { key: "footer.pages", label: "1-ci sütunun başlığı" },
        { key: "footer.services", label: "2-ci sütunun başlığı" },
        { key: "footer.contact", label: "3-cü sütunun başlığı" },
        { key: "footer.social", label: "Sosial şəbəkə başlığı" },
        { key: "footer.copyright", label: "Ən aşağı, solda" },
        { key: "footer.slogan", label: "Ən aşağı, sağda" },
      ],
    },
  ],
};
