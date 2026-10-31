import { useState } from "react";
import { CalendarDays, CircleCheck, Mail, MessageSquareText, Phone, RotateCcw, Trash2 } from "lucide-react";
import { deleteRequest, setRequestHandled } from "@/actions/requests";
import { ConfirmButton } from "@/components/ConfirmButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { initials } from "@/lib/experience";
import { toast } from "@/lib/toast";
import { formatTime } from "@/shared/utils/formatDateTime";
import type { RequestDetailProps } from "@/types/requests";
import { digits, toneOf } from "../utils/requestFormat";

// Seçilmiş müraciət: ad, əlaqə düymələri (zəng, WhatsApp, e-poçt), mesaj, sil və "Baxıldı"
export function RequestDetail({ r }: RequestDetailProps) {
  const [busy, setBusy] = useState(false);
  const phoneDigits = digits(r.phone);

  async function toggle() {
    setBusy(true);
    await setRequestHandled(r.id, !r.handled);
    setBusy(false);
    toast.success(r.handled ? "Yeni kimi işarələndi" : "Baxıldı kimi işarələndi");
  }

  return (
    <section className="card flex flex-col lg:h-[calc(100dvh/var(--zoom)-300px)] lg:min-h-[380px]">
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
      <div className="mt-5 flex flex-wrap gap-2 max-sm:grid max-sm:grid-cols-[auto_minmax(0,1fr)]">
        <a href={`tel:${phoneDigits}`} className="btn btn-primary btn-sm max-sm:justify-center max-sm:px-2.5 max-sm:text-[13px]"><Phone size={14} className="shrink-0" /> <span className="whitespace-nowrap">{r.phone}</span></a>
        {phoneDigits.length >= 11 && (
          <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-sm !bg-[#25D366] !text-white hover:!bg-[#1DA851] max-sm:min-w-0 max-sm:justify-center max-sm:px-2 max-sm:text-[13px]">
            <WhatsAppIcon size={15} className="shrink-0" /> WhatsApp
          </a>
        )}
        {r.email && <a href={`mailto:${r.email}`} className="btn btn-secondary btn-sm max-sm:col-span-2 max-sm:min-w-0 max-sm:justify-center max-sm:text-[13px]"><Mail size={14} className="shrink-0" /> <span className="truncate">{r.email}</span></a>}
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
