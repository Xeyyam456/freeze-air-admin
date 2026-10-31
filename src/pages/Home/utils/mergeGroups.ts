// Eyni group_id-li sətirlər bir tapşırıq olur; names: üzvlərin adları
export function mergeGroups<T extends { group_id: string | null; employees: { full_name: string; photo_url: string | null } | null }>(rows: T[]) {
  type Row = T & { names: string[]; people: { full_name: string; photo_url: string | null }[] };
  const out: Row[] = [];
  const byGroup = new Map<string, Row>();
  for (const t of rows) {
    const name = t.employees?.full_name ?? "—";
    const person = { full_name: name, photo_url: t.employees?.photo_url ?? null };
    const g = t.group_id ? byGroup.get(t.group_id) : undefined;
    if (g) { g.names.push(name); g.people.push(person); continue; }
    const row: Row = { ...t, names: [name], people: [person] };
    out.push(row);
    if (t.group_id) byGroup.set(t.group_id, row);
  }
  return out;
}
