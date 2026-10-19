import { useState } from "react";
import { CalendarDays, CircleCheck, Inbox, Mail, MessageCircle, MessageSquareText, Phone, RotateCcw, Search, Trash2 } from "lucide-react";
import { deleteRequest, setRequestHandled } from "@/actions/requests";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Page } from "@/components/Page";
import type { Tables } from "@/lib/database.types";
import { initials } from "@/lib/experience";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";

type Request = Tables<"contact_requests">;
type Filter = "new" | "handled" | "all";

// "16.10.2026 18:41"
function formatTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// "5 dəq əvvəl", "3 saat əvvəl", sonra tarix
function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "indicə";
  if (min < 60) return `${min} dəq`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} saat`;
  const days = Math.round(h / 24);
  return days < 7 ? `${days} gün` : formatTime(iso).slice(0, 10);
}

const digits = (phone: string) => phone.replace(/\D/g, "");

// Addan sabit rəng: eyni adam həmişə eyni rəngdə
const TONES = ["from-[#0a7ea4] to-[#2dd4bf]", "from-[#6d5efc] to-[#0a7ea4]", "from-[#0ea5a4] to-[#2dd4bf]", "from-[#f59e0b] to-[#f97316]", "from-[#e5484d] to-[#f97316]"];
const toneOf = (name: string) => TONES[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % TONES.length];

const norm = (s: string | null) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Saytın "Bizə yazın" formasından gələn müraciətlər: solda siyahı, sağda seçilmiş müraciət
export default function RequestsPage() {
  const [filter, setFilter] = useState<Filter>("new");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const requests = useData(async () => {
    const { data } = await createClient().from("contact_requests").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

  const counts = {
    new: requests?.filter((r) => !r.handled).length ?? 0,
    handled: requests?.filter((r) => r.handled).length ?? 0,
    all: requests?.length ?? 0,
  };
  const q = norm(query.trim());
  const list = (requests ?? [])
    .filter((r) => (filter === "all" ? true : filter === "new" ? !r.handled : r.handled))
    .filter((r) => !q || [r.name, r.phone, r.email, r.message].some((v) => norm(v).includes(q)));
  // Seçilmiş siyahıda yoxdursa (filtr/silmə), birincisi göstərilir
  const selected = list.find((r) => r.id === selectedId) ?? list[0] ?? null;

  return (
    <Page title="Müraciətlər" subtitle="Saytdakı “Bizə yazın” formasından gələn mesajlar">
      {requests === null ? (
        <div className="card muted">Yüklənir...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex gap-1 rounded-xl bg-line/60 p-1" role="tablist">
              {([["new", "Yeni"], ["handled", "Baxılıb"], ["all", "Hamısı"]] as const).map(([f, label]) => (
                <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    filter === f ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}>
                  {label}
                  <span className={`rounded-full px-1.5 text-xs ${f === "new" && counts.new ? "bg-danger text-white" : "bg-primary-soft text-primary"}`}>{counts[f]}</span>
                </button>
              ))}
            </div>
            <label className="relative w-full max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad, telefon, e-poçt və ya mesaj..."
                className="field !pl-10" aria-label="Müraciət axtar" />
            </label>
          </div>

          {list.length === 0 ? (
            <div className="card grid min-h-[360px] place-items-center text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-bg text-muted"><Inbox size={24} /></span>
                <p className="mt-3 font-semibold">{q ? "Heç nə tapılmadı" : filter === "new" ? "Yeni müraciət yoxdur" : "Müraciət yoxdur"}</p>
                <p className="muted text-sm">{q ? "Axtarışı dəyişin." : "Saytdan yazılan mesajlar burada görünəcək."}</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(340px,420px)_1fr]">
              {/* Siyahı */}
              <ul className="card nice-scroll !p-2 lg:h-[calc(100dvh-300px)] lg:min-h-[380px] lg:overflow-y-auto">
                {list.map((r) => {
                  const active = selected?.id === r.id;
                  return (
                    <li key={r.id}>
                      <button type="button" onClick={() => setSelectedId(r.id)}
                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                          active ? "bg-primary-soft" : "hover:bg-bg"
                        }`}>
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${toneOf(r.name)} text-xs font-bold text-white`}>
                          {initials(r.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className={`truncate text-sm ${r.handled ? "font-medium" : "font-bold"}`}>{r.name}</span>
                            {!r.handled && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" title="Yeni" />}
                            <span className="muted ml-auto shrink-0 text-[11px]">{ago(r.created_at)}</span>
                          </span>
                          <span className="muted mt-0.5 block truncate text-xs">{r.message || r.phone}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Seçilmiş müraciət */}
              {selected && <RequestDetail key={selected.id} r={selected} />}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}

function RequestDetail({ r }: { r: Request }) {
  const [busy, setBusy] = useState(false);
  const phoneDigits = digits(r.phone);

  async function toggle() {
    setBusy(true);
    await setRequestHandled(r.id, !r.handled);
    setBusy(false);
    toast.success(r.handled ? "Yeni kimi işarələndi" : "Baxıldı kimi işarələndi");
  }

  return (
    <section className="card flex flex-col lg:h-[calc(100dvh-300px)] lg:min-h-[380px]">
      <div className="flex flex-wrap items-start gap-4">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${toneOf(r.name)} text-lg font-bold text-white`}>
          {initials(r.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-bold">{r.name}</h2>
            {r.handled
              ? <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-xs font-semibold text-ok">Baxılıb</span>
              : <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">Yeni</span>}
          </div>
          <p className="muted mt-1 flex items-center gap-1.5 text-sm"><CalendarDays size={14} /> {formatTime(r.created_at)}</p>
        </div>
      </div>

      {/* Əlaqə düymələri */}
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`tel:${phoneDigits}`} className="btn btn-primary btn-sm"><Phone size={14} /> {r.phone}</a>
        {phoneDigits.length >= 11 && (
          <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-sm !bg-[#25D366] !text-white hover:!bg-[#1DA851]">
            <MessageCircle size={14} /> WhatsApp
          </a>
        )}
        {r.email && <a href={`mailto:${r.email}`} className="btn btn-secondary btn-sm"><Mail size={14} /> {r.email}</a>}
      </div>

      {/* Mesaj */}
      <div className="mt-5 min-h-0 flex-1">
        <span className="label flex items-center gap-1.5"><MessageSquareText size={14} /> Mesaj</span>
        <div className="nice-scroll max-h-full overflow-y-auto rounded-2xl rounded-tl-sm bg-bg p-5">
          {r.message
            ? <p className="whitespace-pre-line leading-relaxed">{r.message}</p>
            : <p className="muted">Mesaj yazılmayıb: yalnız əlaqə məlumatı göndərilib.</p>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
        <ConfirmButton onConfirm={() => deleteRequest(r.id)} className="btn btn-cancel btn-sm mr-auto" title="Müraciəti sil">
          <Trash2 size={14} /> Sil
        </ConfirmButton>
        <button type="button" onClick={toggle} disabled={busy} className={`btn btn-sm ${r.handled ? "btn-secondary" : "btn-primary"}`}>
          {r.handled ? <><RotateCcw size={14} /> Yeni kimi işarələ</> : <><CircleCheck size={14} /> Baxıldı</>}
        </button>
      </div>
    </section>
  );
}
