import { useState } from "react";
import { MapPinned } from "lucide-react";
import type { LocationLogButtonProps } from "@/types/clients";
import { useLocationLog } from "../../queries/useLocationLog";
import { LocationLogModal } from "./LocationLogModal";
import { Button } from "@/shared/components/Button";

// Başlıqdakı düymə: yalnız dəyişiklik olanda görünür (say ilə); klik → jurnal pəncərəsi
export function LocationLogButton({ companyId, units }: LocationLogButtonProps) {
  const logs = useLocationLog(companyId, units);
  const [open, setOpen] = useState(false);
  if (!logs?.length) return null;

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} variant="soft" size="sm" title="Ustaların ünvan/koordinat düzəlişləri">
        <MapPinned size={15} /> <span className="max-sm:hidden">Konum dəyişiklikləri</span> <b className="tabular-nums">{logs.length}</b>
      </Button>
      {open && <LocationLogModal logs={logs} unitOf={new Map(units.map((u) => [u.id, u]))} onClose={() => setOpen(false)} />}
    </>
  );
}
