import type { TextGroup } from "@/types/site";

export const HOME_TEXTS: TextGroup = {
  id: "home",
  title: "Ana səhifə",
  hint: "“Haqqımızda” mətni və şəkillər “Ana səhifə” tabındadır.",
  sections: [
    {
      title: "Hero (ən üst)",
      fields: [
        { key: "home.hero.badge_out", label: "Sol nişan" },
        { key: "home.hero.badge_in", label: "Sağ nişan" },
        { key: "home.hero.title", label: "Başlıq" },
        { key: "home.hero.lead", label: "Alt mətn", kind: "text" },
        { key: "home.hero.cta", label: "Birinci düymə" },
        { key: "home.hero.cta2", label: "İkinci düymə" },
      ],
    },
    {
      title: "Haqqımızda",
      fields: [
        { key: "home.about.label", label: "Başlıq üstündəki yazı" },
        { key: "home.about.button", label: "Düymə" },
      ],
    },
    {
      title: "Obyektlər bölməsi",
      fields: [
        { key: "home.segments.title", label: "Başlıq" },
        { key: "home.segments.lead", label: "Alt mətn" },
        { key: "home.segments.more", label: "Kartdakı keçid" },
      ],
    },
    {
      title: "Sürətli müraciət (hero-dakı kiçik forma)",
      fields: [
        { key: "home.quick.title", label: "Başlıq" },
        { key: "home.quick.name", label: "Ad sahəsi" },
        { key: "home.quick.phone", label: "Telefon sahəsi" },
        { key: "home.quick.button", label: "Düymə" },
        { key: "home.quick.note", label: "Düymə altındakı yazı" },
        { key: "home.quick.or", label: "Telefon nömrəsinin yanındakı yazı" },
      ],
    },
    {
      title: "Necə işləyirik və Suallar (başlıqlar; sualların məzmunu Sayt → Etibar və suallar)",
      fields: [
        { key: "home.how.title", label: "Necə işləyirik: başlıq" },
        { key: "home.how.lead", label: "Necə işləyirik: alt mətn" },
        { key: "home.how.button", label: "Necə işləyirik: düymə" },
        { key: "home.faq.title", label: "Suallar: başlıq" },
        { key: "home.faq.lead", label: "Suallar: alt mətn" },
        { key: "home.faq.button", label: "Suallar: düymə" },
      ],
    },
    {
      title: "Xidmət kateqoriyaları (tünd aurora zolaq)",
      fields: [
        { key: "home.categories.title", label: "Başlıq" },
        { key: "home.categories.lead", label: "Alt mətn" },
        { key: "home.cat1.title", label: "1-ci kart: başlıq" },
        { key: "home.cat1.items", label: "1-ci kart: siyahı", kind: "list" },
        { key: "home.cat2.title", label: "2-ci kart: başlıq" },
        { key: "home.cat2.items", label: "2-ci kart: siyahı", kind: "list" },
        { key: "home.cat3.title", label: "3-cü kart: başlıq" },
        { key: "home.cat3.items", label: "3-cü kart: siyahı", kind: "list" },
      ],
    },
    {
      title: "Sürətli əlaqə (ən aşağı)",
      fields: [
        { key: "home.contact.label", label: "Başlıq üstündəki yazı" },
        { key: "home.contact.title", label: "Başlıq" },
        { key: "home.contact.text", label: "Alt mətn" },
        { key: "home.contact.phone", label: "Telefon yazısı" },
        { key: "home.contact.address", label: "Ünvan yazısı" },
        { key: "home.contact.hours", label: "İş saatları yazısı" },
        { key: "home.contact.button", label: "Düymə" },
      ],
    },
  ],
};
