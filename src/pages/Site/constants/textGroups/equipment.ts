import type { TextGroup } from "@/types/site";

export const EQUIPMENT_TEXTS: TextGroup = {
  id: "equipment",
  title: "Avadanlıq",
  hint: "Avadanlıq kartları “Avadanlıq” tabındadır.",
  sections: [
    {
      title: "Səhifə başlığı",
      fields: [
        { key: "equipment.title", label: "Başlıq" },
        { key: "equipment.lead", label: "Alt mətn", kind: "text" },
      ],
    },
  ],
};
