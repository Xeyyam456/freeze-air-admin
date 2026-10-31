import type { TextGroup } from "@/types/site";

export const HOW_TEXTS: TextGroup = {
  id: "how",
  title: "Necə işləyirik",
  sections: [
    {
      title: "Səhifə başlığı",
      fields: [
        { key: "how.title", label: "Başlıq" },
        { key: "how.lead", label: "Alt mətn", kind: "text" },
      ],
    },
    {
      title: "Addımlar",
      fields: [
        { key: "how.step1.title", label: "1-ci addım: başlıq" },
        { key: "how.step1.text", label: "1-ci addım: mətn", kind: "text" },
        { key: "how.step2.title", label: "2-ci addım: başlıq" },
        { key: "how.step2.text", label: "2-ci addım: mətn", kind: "text" },
        { key: "how.step3.title", label: "3-cü addım: başlıq" },
        { key: "how.step3.text", label: "3-cü addım: mətn", kind: "text" },
      ],
    },
    {
      title: "Tünd blok",
      fields: [
        { key: "how.deliverables", label: "Başlıq" },
        { key: "how.d1.title", label: "1: başlıq" },
        { key: "how.d1.text", label: "1: mətn", kind: "text" },
        { key: "how.d2.title", label: "2: başlıq" },
        { key: "how.d2.text", label: "2: mətn", kind: "text" },
        { key: "how.d3.title", label: "3: başlıq" },
        { key: "how.d3.text", label: "3: mətn", kind: "text" },
      ],
    },
  ],
};
