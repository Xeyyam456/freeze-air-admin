import { useState } from "react";
import { CalendarOff, Check, Hourglass, List as ListIcon, Trash2, X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Page } from "@/components/Page";
import { leaveRange, leaveWorkdays } from "@/lib/attendance";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";

type Filter = "pending" | "all";

const STATUS = {
  pending: { text: "Gözləyir", cls: "bg-primary-soft text-primary" },
  approved: { text: "Təsdiqləndi", cls: "bg-ok-soft text-ok" },
  rejected: { text: "Rədd edildi", cls: "bg-danger-soft text-danger" },
  cancelled: { text: "Usta ləğv etdi", cls: "bg-bg text-muted" },
} as const;

async function fetchLeaves() {
  const { data } = await createClient()
    .from("leave_requests")
    .select("id, employee_id, date_from, date_to, reason, status, created_at, decided_at, employees(full_name, photo_url)")
    .order("created_at", { ascending: false })
    .limit(300);
  return data ?? [];
}

// "21.10.2026 18:41" (Bakı vaxtı)
function stamp(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date(iso)).replace(",", "").replaceAll("/", ".");
}

// Köhnə sorğunu silmək (0067): yalnız cavablanmış; təsdiqlənmiş icazə silinsə həmin günlər "gəlmədi" sayılır
async function removeLeaves(ids: number[]) {
  if (ids.length === 0) return;
  const { error } = await createClient().from("leave_requests").delete().in("id", ids).neq("status", "pending");
  if (error) return toast.error(error.message);
  toast.success(ids.length > 1 ? `${ids.length} sorğu silindi` : "Sorğu silindi");
  revalidate();
}

async function decide(id: number, approve: boolean) {
  const { error } = await createClient().rpc("leave_decide", { p_id: id, p_approve: approve });
  if (error) return toast.error(error.message);
  toast.success(approve ? "İcazə təsdiqləndi" : "İcazə rədd edildi");
  revalidate();
}

// İcazələr (migrasiya 0059): usta usta panelindən icazə istəyir, admin/rəhbərlik burada təsdiqləyir və ya rədd edir; köhnələri silir (0067).
// Təsdiqlənən günlər davamiyyətdə "İcazəli" sayılır (Ustalar kartlarında). Yeni sorğu Realtime ilə gəlir (TasksListener).
export default function LeavesPage() {
  const data = useData(fetchLeaves);
  const [filter, setFilter] = useState<Filter>("pending");
  const pending = data?.filter((l) => l.status === "pending") ?? [];
  const list = filter === "pending" ? pending : data ?? [];
  // Davamiyyətə təsir etməyənlər: rədd və ləğv edilənlər (toplu silinir)
  const closed = data?.filter((l) => l.status === "rejected" || l.status === "cancelled") ?? [];

  return (
    <Page title="İcazələr" subtitle="Ustaların icazə sorğuları: təsdiqlə və ya rədd et">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
        {/* .seg ikon düymələri üçündür (36px): mətnli tablarda en məzmuna görə */}
        <div className="seg" role="tablist" aria-label="İcazə sorğuları">
          <button type="button" role="tab" aria-selected={filter === "pending"} onClick={() => setFilter("pending")} className="!w-auto gap-2 !flex items-center whitespace-nowrap px-4 text-sm font-semibold">
            <Hourglass size={15} /> Gözləyənlər <span className="rounded-full bg-surface px-1.5 text-xs">{pending.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={filter === "all"} onClick={() => setFilter("all")} className="!w-auto gap-2 !flex items-center whitespace-nowrap px-4 text-sm font-semibold">
            <ListIcon size={15} /> Hamısı <span className="rounded-full bg-surface px-1.5 text-xs">{data?.length ?? 0}</span>
          </button>
        </div>
          {filter === "all" && closed.length > 0 && (
            <ConfirmButton onConfirm={() => removeLeaves(closed.map((l) => l.id))} success={false} className="btn btn-soft btn-sm ml-auto text-danger"
              title="Rədd və ləğv edilən sorğuları sil" confirmLabel="Bəli, sil"
              question={`${closed.length} rədd və ya ləğv edilmiş sorğu silinəcək. Davamiyyətə təsir etmir.`}>
              <Trash2 size={14} /> Rədd və ləğv edilənləri sil ({closed.length})
            </ConfirmButton>
          )}
        </div>

        {data === null ? (
          <div className="card muted py-12 text-center text-sm">Yüklənir...</div>
        ) : list.length === 0 ? (
          <div className="card py-14 text-center">
            <span className="icon-tile mx-auto"><CalendarOff size={20} /></span>
            <p className="mt-3 font-semibold">{filter === "pending" ? "Gözləyən sorğu yoxdur" : "Hələ icazə sorğusu olmayıb"}</p>
            <p className="muted text-sm">Ustalar icazəni usta panelində "İcazə istə" ilə göndərir.</p>
          </div>
        ) : (
          <ul className="card divide-y divide-line !p-0">
            {list.map((l) => {
              const st = STATUS[l.status as keyof typeof STATUS] ?? STATUS.pending;
              return (
                <li key={l.id} className="flex items-center gap-4 px-5 py-3">
                  <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-bold">{l.employees?.full_name ?? "—"}</span>
                      <span className="ml-2 font-semibold text-primary">{leaveRange(l)}</span>
                      <span className="muted"> · {leaveWorkdays(l)} iş günü</span>
                    </p>
                    <p className="muted truncate text-sm">{l.reason ?? "Səbəb yazılmayıb"}</p>
                    <p className="muted text-[11px]">Göndərilib: {stamp(l.created_at)}{l.decided_at && ` · cavab: ${stamp(l.decided_at)}`}</p>
                  </div>
                  {l.status === "pending" ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => decide(l.id, false)} className="btn btn-soft btn-sm"><X size={14} /> Rədd et</button>
                      <button type="button" onClick={() => decide(l.id, true)} className="btn btn-primary btn-sm"><Check size={14} /> Təsdiqlə</button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.text}</span>
                      <ConfirmButton onConfirm={() => removeLeaves([l.id])} success={false} className="icon-btn icon-btn-danger !h-8 !w-8" title="Sorğunu sil"
                        question={l.status === "approved"
                          ? `${l.employees?.full_name ?? "Usta"}: ${leaveRange(l)} təsdiqlənmiş icazəsi silinəcək. Bu günlər davamiyyətdə "gəlmədi" sayılacaq.`
                          : "Sorğu silinəcək. Davamiyyətə təsir etmir."}>
                        <Trash2 size={15} />
                      </ConfirmButton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Page>
  );
}
