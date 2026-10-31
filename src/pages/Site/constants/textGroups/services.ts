import type { TextGroup } from "@/types/site";

export const SERVICES_TEXTS: TextGroup = {
  id: "services",
  title: "Xidmətlər",
  hint: "Hər xidmətin öz məzmunu “Xidmətlər” tabında, obyektlərin məzmunu “Obyektlər” tabındadır.",
  sections: [
    {
      title: "Xidmətlər səhifəsi",
      fields: [
        { key: "services.title", label: "Başlıq" },
        { key: "services.lead", label: "Alt mətn", kind: "text" },
        { key: "services.segments", label: "Obyektlər bölməsinin başlığı" },
        { key: "services.list", label: "Siyahının başlığı" },
        { key: "services.cta_text", label: "Aşağı zolaq: mətn" },
        { key: "services.cta_button", label: "Aşağı zolaq: düymə" },
      ],
    },
    {
      title: "Xidmət səhifəsi (hamısı üçün ortaq)",
      fields: [
        { key: "service.includes", label: "“Nə daxildir” başlığı" },
        { key: "service.steps", label: "“Necə edirik” başlığı" },
        { key: "service.aside_title", label: "Sağ blok: başlıq" },
        { key: "service.aside_text", label: "Sağ blok: mətn", kind: "text" },
        { key: "service.others", label: "Digər xidmətlər başlığı" },
        { key: "service.more", label: "Kartdakı keçid" },
      ],
    },
    {
      title: "Obyekt səhifəsi (hamısı üçün ortaq)",
      fields: [
        { key: "segment.cta", label: "Düymə" },
        { key: "segment.equipment", label: "Avadanlıq bölməsinin başlığı" },
        { key: "segment.issues", label: "Problemlər kartının başlığı" },
        { key: "segment.work", label: "Görülən işlər kartının başlığı" },
        { key: "segment.note_fallback", label: "Aşağı zolaq (obyektdə qeyd yoxdursa)" },
        { key: "segment.others", label: "Digər obyektlər başlığı" },
      ],
    },
  ],
};
