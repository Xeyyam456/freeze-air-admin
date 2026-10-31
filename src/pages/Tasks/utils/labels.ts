import type { SelectableEmployee } from "@/types/employees";
import type { Crew, Task, TaskEmployee } from "@/types/tasks";

// Yer: mağaza/filial (şirkət adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer | silinib
export function placeOf(t: Task) {
  if (t.stores) return `${t.stores.companies?.name ?? ""} · ${t.stores.code} ${t.stores.name}`;
  if (t.companies) return t.companies.name;
  return t.place_text ?? "Yer silinib";
}

// Qrupun adı: üzvlərin soyadsız adları "Xəyyam + Fərhad"
export const teamLabel = (ids: number[], employees: TaskEmployee[]) =>
  ids.map((id) => employees.find((e) => e.id === id)?.full_name.split(" ").slice(-1)[0] ?? "—").join(" + ");

// Briqadanın görünən adı: adı yoxdursa (0075) üzvlərin soyadsız adları "Xəyyam + Fərhad"
export function crewLabel(c: Crew, people: SelectableEmployee[]) {
  return c.name ?? (people.map((p) => p.full_name.split(" ").slice(-1)[0]).join(" + ") || "Adsız briqada");
}

// İşdə video var (0089)
export const hasVideo = (rows: Task[]) => rows.some((x) => x.work_logs?.work_files.some((f) => f.kind === "video"));
