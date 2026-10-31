import type { TextGroup } from "@/types/site";

export const CONTACT_TEXTS: TextGroup = {
  id: "contact",
  title: "Əlaqə",
  hint: "Telefon, ünvan, saatlar və e-poçt “Əlaqə” tabındadır.",
  sections: [
    {
      title: "Əlaqə səhifəsi",
      fields: [
        { key: "contact.title", label: "Başlıq" },
        { key: "contact.lead", label: "Alt mətn", kind: "text" },
        { key: "contact.call_label", label: "Telefon üstündəki yazı" },
        { key: "contact.call", label: "Zəng düyməsi" },
        { key: "contact.whatsapp", label: "WhatsApp düyməsi" },
        { key: "contact.address", label: "Ünvan kartı" },
        { key: "contact.hours", label: "İş saatları kartı" },
        { key: "contact.email", label: "E-poçt kartı" },
        { key: "contact.map_reset", label: "Xəritə: ünvana qayıtma düyməsi" },
        { key: "contact.route", label: "Xəritə: marşrut düyməsi" },
        { key: "contact.route_loading", label: "Xəritə: yer təyin olunarkən" },
        { key: "contact.route_denied", label: "Xəritə: yer təyin olunmadıqda (xəta)" },
        { key: "contact.route_open", label: "Xəritə: Google Maps naviqasiyası düyməsi" },
        { key: "contact.waze", label: "Xəritə: Waze düyməsi (planşet və telefonda)" },
      ],
    },
    {
      title: "“Bizə yazın” forması",
      fields: [
        { key: "form.title", label: "Başlıq" },
        { key: "form.lead", label: "Alt mətn" },
        { key: "form.name", label: "Ad sahəsi" },
        { key: "form.phone", label: "Telefon sahəsi" },
        { key: "form.email", label: "E-poçt sahəsi" },
        { key: "form.message", label: "Mesaj sahəsi" },
        { key: "form.submit", label: "Düymə" },
        { key: "form.sending", label: "Göndərilərkən düymə" },
        { key: "form.success_title", label: "Göndərildikdən sonra: başlıq" },
        { key: "form.success_text", label: "Göndərildikdən sonra: mətn", kind: "text" },
      ],
    },
  ],
};
