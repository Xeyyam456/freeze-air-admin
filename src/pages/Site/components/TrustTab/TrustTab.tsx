import { FaqSection } from "./FaqSection";
import { StatsSection } from "./StatsSection";

// "Etibar və suallar": ana səhifənin rəqəmlər zolağı və FAQ bölməsi
export function TrustTab() {
  return (
    <div className="space-y-5">
      <StatsSection />
      <FaqSection />
    </div>
  );
}
