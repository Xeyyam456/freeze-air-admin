import { Avatar } from "@/shared/components/Avatar";
import type { MemberFacesProps } from "@/types/tasks";

// Ustaların kiçik şəkil + ad siyahısı (pəncərələrdə)
export function MemberFaces({ ids, employees }: MemberFacesProps) {
  return (
    <>
      {ids.map((id) => employees.find((e) => e.id === id)).filter((e) => !!e).map((e) => (
        <span key={e.id} className="flex items-center gap-1 font-semibold text-ink"><Avatar employee={e} className="!h-4 !w-4 !text-[7px] !shadow-none" />{e.full_name}</span>
      ))}
    </>
  );
}
