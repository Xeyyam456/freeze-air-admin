import { IconTile } from "@/shared/components/IconTile";
import { Users } from "lucide-react";
import type { EmptyEmployeesProps } from "@/types/employees";
import { Card } from "@/shared/components/Card";

export function EmptyEmployees({ admin }: EmptyEmployeesProps) {
  return (
    <Card className="py-12 text-center">
      <IconTile className="mx-auto"><Users size={20} /></IconTile>
      <p className="mt-3 font-semibold">Hələ usta yoxdur</p>
      {admin && <p className="muted text-sm">Yuxarıdakı «Yeni usta» düyməsi ilə ilk ustanı əlavə et.</p>}
    </Card>
  );
}
