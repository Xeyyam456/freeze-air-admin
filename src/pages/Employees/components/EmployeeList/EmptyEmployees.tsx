import { Users } from "lucide-react";
import type { EmptyEmployeesProps } from "@/types/employees";

export function EmptyEmployees({ admin }: EmptyEmployeesProps) {
  return (
    <div className="card py-12 text-center">
      <span className="icon-tile mx-auto"><Users size={20} /></span>
      <p className="mt-3 font-semibold">Hələ usta yoxdur</p>
      {admin && <p className="muted text-sm">Yuxarıdakı «Yeni usta» düyməsi ilə ilk ustanı əlavə et.</p>}
    </div>
  );
}
