import { useState } from "react";
import { AirVent, Image as ImageIcon, LayoutGrid, List, Phone, ShieldCheck, Type } from "lucide-react";
import { Page } from "@/components/Page";
import { ContactTab } from "@/components/site/ContactTab";
import { EquipmentTab, SegmentsTab } from "@/components/site/ContentTabs";
import { ServicesTab } from "@/components/site/ServicesTab";
import { HomeTab } from "@/components/site/HomeTab";
import { TextsTab } from "@/components/site/TextsTab";
import { TrustTab } from "@/components/site/TrustTab";


type Tab = "contact" | "texts" | "hero" | "trust" | "segments" | "equipment" | "services";

const TABS: { id: Tab; label: string; icon: typeof Phone }[] = [
  { id: "contact", label: "Əlaqə", icon: Phone },
  { id: "hero", label: "Ana səhifə", icon: ImageIcon },
  { id: "trust", label: "Etibar və suallar", icon: ShieldCheck },
  { id: "texts", label: "Mətnlər", icon: Type },
  { id: "segments", label: "Obyektlər", icon: LayoutGrid },
  { id: "equipment", label: "Avadanlıq", icon: AirVent },
  { id: "services", label: "Xidmətlər", icon: List },
];

// Açıq saytın idarəsi: əlaqə məlumatları, ana səhifə (hero şəkli, Haqqımızda), obyekt növləri, avadanlıq, xidmətlər siyahısı.
// Dəyişikliklər saytda ən gec 1 dəqiqəyə görünür.
export default function SitePage() {
  const [tab, setTab] = useState<Tab>("contact");

  return (
    <Page title="Sayt" subtitle="Açıq saytın məzmunu: dəyişikliklər saytda ən gec 1 dəqiqəyə görünür">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex gap-1 rounded-xl bg-line/60 p-1" role="tablist">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
        {tab === "contact" ? <ContactTab /> : tab === "hero" ? <HomeTab /> : tab === "trust" ? <TrustTab /> : tab === "texts" ? <TextsTab /> : tab === "segments" ? <SegmentsTab /> : tab === "equipment" ? <EquipmentTab /> : <ServicesTab />}
      </div>
    </Page>
  );
}
