import { Page } from "@/components/Page";
import { CarList } from "./components/CarList";
import { FuelHeader } from "./components/FuelHeader";
import { NoCars } from "./components/NoCars";
import { PayModal } from "./components/PayModal";
import { PricesBar } from "./components/PricesBar";
import { useFuelPage } from "./hooks/useFuelPage";

// Yanacaq (0077-0079): maşını olan ustaların gündəlik yürüşü (səhər/axşam spidometr şəkli + km).
// Başlıq seçilmiş ustanı göstərir: həmişə BU GÜNÜN hesabatı + seçilmiş dövrün (gün / həftə / ay) yanacaq pulu ayrıca.
// Kartlarda da bu günün hesabatı; qiymətlər və 100 km-ə sərf buradan yazılır (gün bağlananda sətrə yazılır, köhnə günlər dəyişmir).
export default function FuelPage() {
  const f = useFuelPage();
  return (
    <Page title="Yanacaq" subtitle="Maşını olan ustaların yürüşü və yanacaq pulu">
      {f.paying && <PayModal name={f.paying.name} employeeId={f.paying.id} today={f.today} suggest={f.paying.suggest} onClose={f.closePay} />}
      {!f.data ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <div className="space-y-4">
          <FuelHeader sel={f.sel} today={f.today} period={f.period} range={f.range} monthR={f.monthR} atEnd={f.atEnd}
            onPeriod={f.choosePeriod} onShift={f.shift} onPay={f.pay} />
          <PricesBar prices={f.data.prices} />
          {f.data.cars.length === 0 ? <NoCars /> : (
            <CarList cars={f.cars} selId={f.sel?.car.id} open={f.open} paysOpen={f.paysOpen} period={f.period} range={f.range} today={f.today}
              onPick={f.pick} onToggle={f.toggle} onTogglePays={f.togglePays} />
          )}
        </div>
      )}
    </Page>
  );
}
