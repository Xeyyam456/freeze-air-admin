import type { CarListProps } from "@/types/fuel";
import { CarCard } from "../CarCard";

export function CarList({ cars, selId, open, paysOpen, period, range, today, onPick, onToggle, onTogglePays }: CarListProps) {
  return (
    <ul className="space-y-3">
      {cars.map((item) => {
        const id = item.car.id;
        return (
          <CarCard key={id} item={item} selected={selId === id} expanded={open === id} paysOpen={paysOpen === id}
            period={period} range={range} today={today}
            onPick={() => onPick(id)} onToggle={() => onToggle(id)} onTogglePays={() => onTogglePays(id)} />
        );
      })}
    </ul>
  );
}
