import { fmt } from "../quantity";
import { REASONS } from "../../constants/requests";
import { txt, num, date, time, pill, MUTED, INK } from "./style";
import { sheet } from "./sheet";
import { reasonHue } from "./losses";
import type { Col, Ctx } from "@/types/depot";

export function lossesSheet({ losses, employees, stamp }: Ctx) {
  const empName = new Map(employees.map((e) => [e.id, e.full_name]));
  const cols: Col[] = [{ label: "№", width: 5 }, { label: "Tarix", width: 12 }, { label: "Saat", width: 8 }, { label: "Ad", width: 28, align: "left" }, { label: "Növ", width: 11 },
    { label: "Miqdar", width: 13 }, { label: "Səbəb", width: 15 }, { label: "İzah", width: 34, align: "left" }, { label: "Kimdən", width: 20, align: "left" },
    { label: "Yazan", width: 20, align: "left" }, { label: "Təsdiqləyən", width: 20, align: "left" }];
  const rows = losses.map((r, i) => {
    const mat = r.tool_kind === "material";
    return [num(i, i + 1, { textColor: MUTED }), date(i, r.decided_at), txt(i, r.decided_at ? time(r.decided_at) : "", { align: "center", indent: 0 }),
      txt(i, r.tool_name, { fontWeight: "bold" }), pill(i, mat ? "Material" : "Alət", mat ? "teal" : "blue"),
      txt(i, `${fmt(r.quantity ?? 0)} ${mat ? r.unit : "ədəd"}`, { align: "center", indent: 0, fontWeight: "bold" }),
      pill(i, REASONS[r.reason ?? "other"] ?? r.reason ?? "", reasonHue[r.reason ?? "other"] ?? "slate"), txt(i, r.note ?? "—", { wrap: true, textColor: r.note ? INK : "#b4bcc9" }),
      txt(i, r.employee_id ? empName.get(r.employee_id) ?? "usta" : "depodan"), txt(i, r.created_by_name ?? ""), txt(i, r.decided_by_name ?? "")];
  });
  const cnt = (k: string) => losses.filter((l) => l.reason === k).length;
  return sheet({
    name: "Silinənlər", title: "Silinənlər", hue: "red", stamp, cols, rows,
    sub: `${stamp}  ·  təsdiqlənmiş silinmə aktları, səbəbi və izahı ilə  ·  ${losses.length} akt`,
    kpis: [{ label: "Cəmi akt", value: losses.length, hue: "navy" }, { label: "Xarab", value: cnt("broken"), hue: "red" }, { label: "İtib", value: cnt("lost"), hue: "amber" },
      { label: "Oğurlanıb", value: cnt("stolen"), hue: "red" }, { label: "Sərf / başqa", value: cnt("used") + cnt("other"), hue: "slate" }],
  });
}
