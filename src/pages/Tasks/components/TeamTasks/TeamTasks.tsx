import { useState } from "react";
import { Users } from "lucide-react";
import type { TeamTasksProps } from "@/types/tasks";
import { CrewRow } from "../CrewRow";
import { Card } from "@/shared/components/Card";

// Qrup tapşırıqları (0071): eyni üzvlərdən ibarət qruplar; qrupun üstünə basmayınca tapşırıqları açılmır
export function TeamTasks({ crews, liveCount, employees, actions }: TeamTasksProps) {
  const [openCrew, setOpenCrew] = useState<string | null>(null); // hamısı bağlı başlayır
  return (
    <Card as="section" className="overflow-hidden !p-0">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Users size={16} className="text-primary" /> Qrup tapşırıqları
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{liveCount}</span>
        </h3>
        <span className="muted text-xs font-normal max-sm:hidden">biri «görüldü» basanda hamı üçün görülür</span>
      </header>
      <ul className="divide-y divide-line">
        {crews.map((crew) => (
          <CrewRow key={crew.key} crew={crew} employees={employees} open={openCrew === crew.key} actions={actions}
            onToggle={() => setOpenCrew(openCrew === crew.key ? null : crew.key)} />
        ))}
      </ul>
    </Card>
  );
}
