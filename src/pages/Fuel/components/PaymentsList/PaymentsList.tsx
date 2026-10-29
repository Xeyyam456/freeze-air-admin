import { ChevronDown, HandCoins, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { PaymentsListProps } from "@/types/fuel";
import { deletePayment } from "../../queries/mutations";
import { dayName, numDate } from "../../shared/dates";
import { azn } from "../../shared/money";
import { PayStatus } from "../PayStatus";

// "Verilən pullar": ayrıca açılan bölmə (bağlı başlayır); hər ödənişdə ustanın cavabı və silmə
export function PaymentsList({ payments, paid, open, onToggle }: PaymentsListProps) {
  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="flex w-full items-center gap-2.5 border-t border-line px-5 py-2.5 text-left text-sm transition-colors hover:bg-bg">
        <HandCoins size={16} className="shrink-0 text-primary" />
        <span className="font-semibold">Verilən pullar</span>
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{payments.length}</span>
        <span className="ml-auto font-bold tabular-nums">{azn(paid)}</span>
        <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="divide-y divide-line border-t border-line bg-bg/40">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-5 py-2 text-sm max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-2 max-sm:gap-y-1 max-sm:px-3.5">
              <HandCoins size={15} className="shrink-0 text-primary max-sm:hidden" />
              <span className="w-[4.5rem] shrink-0 text-xs font-semibold tabular-nums max-sm:w-auto">{numDate(p.day)}</span>
              <b className="tabular-nums max-sm:text-right">{azn(Number(p.amount))}</b>
              <span className="muted min-w-0 flex-1 truncate text-xs">{p.note}</span>
              <span className="flex shrink-0 items-center gap-3 max-sm:justify-end max-sm:gap-2">
                <PayStatus p={p} />
                <ConfirmButton onConfirm={() => deletePayment(p.id)} success={false} className="icon-btn icon-btn-danger !h-7 !w-7" title="Ödənişi sil"
                  question={`${dayName(p.day)}: ${azn(Number(p.amount))} ödəniş silinəcək, balans dəyişəcək.`}>
                  <Trash2 size={13} />
                </ConfirmButton>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
