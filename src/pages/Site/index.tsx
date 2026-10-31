import { useState } from "react";
import { Page } from "@/components/Page";
import { ContactTab } from "./components/ContactTab";
import { EquipmentTab } from "./components/EquipmentTab";
import { HomeTab } from "./components/HomeTab";
import { SegmentsTab } from "./components/SegmentsTab";
import { ServicesTab } from "./components/ServicesTab";
import { SiteTabs } from "./components/SiteTabs";
import { TextsTab } from "./components/TextsTab";
import { TrustTab } from "./components/TrustTab";
import type { SiteTab } from "@/types/site";

const VIEWS: Record<SiteTab, React.ComponentType> = {
  contact: ContactTab,
  hero: HomeTab,
  trust: TrustTab,
  texts: TextsTab,
  segments: SegmentsTab,
  equipment: EquipmentTab,
  services: ServicesTab,
};

// Açıq saytın idarəsi: əlaqə məlumatları, ana səhifə (hero şəkli, Haqqımızda), obyekt növləri, avadanlıq, xidmətlər siyahısı.
// Dəyişikliklər saytda ən gec 1 dəqiqəyə görünür.
export default function SitePage() {
  const [tab, setTab] = useState<SiteTab>("contact");
  const View = VIEWS[tab];

  return (
    <Page title="Sayt" subtitle="Açıq saytın məzmunu: dəyişikliklər saytda ən gec 1 dəqiqəyə görünür">
      <div className="space-y-5">
        <SiteTabs tab={tab} onTab={setTab} />
        <View />
      </div>
    </Page>
  );
}
