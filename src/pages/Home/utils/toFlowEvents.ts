import type { FlowEvent, FlowNamed, FlowPlaced, FlowRaw } from "@/types/dashboard";
import { MOVE_KINDS } from "../constants/moveKinds";

const place = (p: FlowPlaced) => p.stores?.name ?? p.companies?.name ?? p.place_text ?? "";
const who = (p: FlowNamed) => p.employees?.full_name ?? "";
const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(", ");

// Xam sətirləri zolaq hadisələrinə çevirir. Müddətli hadisələr: tapşırıq (verildi → görüldü), davamiyyət (gəldi → getdi),
// yürüş (başladı → bitdi), depo istəyi və icazə (istək → qərar). Sonu olmayan müddət "indi"yə qədər davam edir.
export function toFlowEvents(r: FlowRaw): FlowEvent[] {
  return [
    ...r.requests.map((x) => ({ id: `r${x.id}`, lane: "requests" as const, at: x.created_at, pending: !x.handled, title: `Müraciət: ${x.name}` })),
    ...r.tasks.map((x) => ({
      id: `t${x.id}`, lane: "tasks" as const, at: x.created_at, end: x.done_at, ongoing: !x.done_at,
      title: join(x.done_at ? "Tapşırıq görüldü" : "Tapşırıq gözləyir", who(x), place(x)),
    })),
    ...r.work.map((x) => ({ id: `w${x.id}`, lane: "work" as const, at: x.created_at, logId: x.id, title: join("İş yazıldı", who(x), place(x)) })),
    ...r.attendance.filter((x) => x.checked_in_at).map((x) => ({
      id: `a${x.id}`, lane: "attendance" as const, at: x.checked_in_at!, end: x.checked_out_at, ongoing: !x.checked_out_at,
      title: join(who(x), x.checked_out_at ? "gəldi və getdi" : "işdədir"),
    })),
    ...r.moves.map((x) => ({ id: `m${x.id}`, lane: "depot" as const, at: x.at, title: join(`Depo: ${MOVE_KINDS[x.kind] ?? x.kind}`, x.tool_name, `${x.quantity} ${x.unit ?? ""}`.trim()) })),
    ...r.depotReqs.map((x) => ({
      id: `d${x.id}`, lane: "depot" as const, at: x.created_at, end: x.decided_at, ongoing: !x.decided_at, pending: !x.decided_at,
      title: join(x.decided_at ? "Depo istəyi cavablandı" : "Depo istəyi gözləyir", x.tool_name, x.created_by_name),
    })),
    ...r.leaves.map((x) => ({
      id: `l${x.id}`, lane: "leaves" as const, at: x.created_at, end: x.decided_at, ongoing: !x.decided_at, pending: !x.decided_at,
      title: join(x.decided_at ? "İcazə cavablandı" : "İcazə gözləyir", who(x)),
    })),
    ...r.mileage.filter((x) => x.start_at).map((x) => ({
      id: `k${x.id}`, lane: "fuel" as const, at: x.start_at!, end: x.end_at, ongoing: !x.end_at, title: join("Yürüş", who(x)),
    })),
    ...r.payments.map((x) => ({
      id: `p${x.id}`, lane: "fuel" as const, at: x.created_at, pending: x.status !== "received", title: join("Yanacaq pulu", who(x), `${x.amount} ₼`),
    })),
    ...r.announcements.map((x) => ({ id: `n${x.id}`, lane: "announcements" as const, at: x.created_at, title: `Elan: ${x.title}` })),
  ];
}
