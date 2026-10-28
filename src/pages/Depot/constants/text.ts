import type { Kind, KindText } from "@/types/depot";

// Hər növün mətnləri
export const TEXT: Record<Kind, KindText> = {
  tool: {
    tab: "Alətlər", col: "Alət", newTitle: "Yeni alət", addLabel: "Aləti əlavə et", added: "Alət əlavə edildi", editTitle: "Aləti redaktə et",
    deleteTitle: "Aləti sil", qty: "Say", placeholder: "Vakuum nasos", search: "Alət və ya usta axtar...",
    empty: "Hələ alət yoxdur", hint: "Üzərindəki alətlər", peopleCol: "Ədəd", word: "alət",
  },
  material: {
    tab: "Materiallar", col: "Material", newTitle: "Yeni material", addLabel: "Materialı əlavə et", added: "Material əlavə edildi", editTitle: "Materialı redaktə et",
    deleteTitle: "Materialı sil", qty: "Miqdar", placeholder: "Mis boru 3/8", search: "Material və ya usta axtar...",
    empty: "Hələ material yoxdur", hint: "Üzərindəki materiallar", peopleCol: "Növ", word: "material",
  },
};
