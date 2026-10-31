import { useData } from "@/lib/useData";
import { fetchHomeData } from "@/services/site/fetchSite";
import { HOME_TEXT_KEYS } from "../../constants/homeConstants";
import { AboutSection } from "./AboutSection";
import { HeroFormCard } from "./HeroFormCard";
import { HeroImageCard } from "./HeroImageCard";
import { LogoCard } from "./LogoCard";

// Ana səhifənin və saytın idarə olunan hissələri: loqo, hero şəkli, sürətli forma və "Haqqımızda" bölməsi.
// Hər bölmənin yanında saytdakı görünüşünün kiçik önizləməsi var.
export function HomeTab() {
  const data = useData("site-home", () => fetchHomeData(HOME_TEXT_KEYS));

  if (!data?.settings) return <div className="card muted">Yüklənir...</div>;
  const { settings, t } = data;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(320px,400px)_1fr]">
        <LogoCard settings={settings} t={t} />
        <HeroImageCard settings={settings} t={t} />
      </div>
      <HeroFormCard enabled={settings.hero_form_enabled} phone={settings.phone ?? ""} t={t} />
      <AboutSection settings={settings} />
    </div>
  );
}
