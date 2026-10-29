import { Avatar } from "@/components/employees/EmployeeForms";
import type { FacesProps } from "@/types/tasks";

// Üst-üstə avatarlar (briqada üzvləri)
export function Faces({ people, size = "!h-7 !w-7 !text-[9px]", ring = "ring-white" }: FacesProps) {
  return (
    <span className="flex -space-x-2">
      {people.map((p) => <Avatar key={p.id} employee={p} className={`${size} !shadow-none ring-2 ${ring}`} />)}
    </span>
  );
}
