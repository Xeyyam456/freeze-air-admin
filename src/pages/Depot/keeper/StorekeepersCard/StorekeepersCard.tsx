import { useState } from "react";
import { KeyRound, UserPlus, Users, X } from "lucide-react";
import { setStorekeeper } from "@/services/storekeeper/storekeeper";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AccountSection } from "@/shared/components/AccountSection";
import { Avatar } from "@/shared/components/Avatar";
import { ToolPicker } from "@/shared/components/ToolPicker";
import { NewKeeperForm } from "../NewKeeperForm";
import type { StorekeepersCardProps } from "@/types/storekeeper";
import { Button } from "@/shared/components/Button";

// Depo məsulları (yalnız admin görür, başlıqdakı ⚙ pəncərəsində): yeni depo məsulu yarat + giriş hesabı aç, mövcud əməkdaşı təyin et, hesabı idarə et.
// Depo məsulu usta paneli ilə daxil olur: orada yalnız ona görünən "Depo" bölməsini idarə edir.
export function StorekeepersCard({ employees, accounts, selfId }: StorekeepersCardProps) {
  const keepers = employees.filter((e) => e.is_storekeeper);
  const [picked, setPicked] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null); // hesabı açıq olan depo məsulu
  // Admin öz kartını dəyişə bilmir (baza qaydası); depo məsulu olanlar siyahıda yoxdur
  const candidates = employees
    .filter((e) => !e.is_storekeeper && e.id !== selfId)
    .map((e) => ({ id: e.id, name: e.full_name, hint: e.is_management ? "rəhbər" : "usta" }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 max-[380px]:flex-wrap">
        <p className="muted min-w-0 flex-1 text-[13px] max-sm:text-xs max-sm:leading-snug"><span className="max-[380px]:hidden">Depo məsulu da adminlər kimi mədaxil, silinmə yazır və sənədləri təsdiqləyir.</span><span className="min-[381px]:hidden">Adminlər kimi mədaxil, silinmə yazır, sənədləri təsdiqləyir.</span></p>
        {!adding && (
          <Button type="button" onClick={() => setAdding(true)} size="sm" className="shrink-0"><UserPlus size={14} /> Yeni</Button>
        )}
      </div>

      {adding && <NewKeeperForm onDone={() => setAdding(false)} />}

      {keepers.length === 0 ? (
        <p className="muted rounded-xl bg-bg px-3 py-3 text-sm">Təyin olunmayıb. Hələlik depoda dəyişikliyi adminlər edir.</p>
      ) : (
        <ul className="space-y-1.5">
          {keepers.map((e) => {
            const email = accounts.emails[e.id] ?? null;
            return (
              <li key={e.id} className="rounded-xl bg-bg px-2.5 py-2">
                <div className="flex items-center gap-2.5">
                  <Avatar employee={e} className="!h-8 !w-8 !text-[11px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{e.full_name}</span>
                    {/* Hesabı olmayan depo məsulu panelə daxil ola bilmir */}
                    {e.user_id
                      ? <span className="muted block truncate text-[11px]">{email ?? "Giriş hesabı var"}</span>
                      : <span className="block text-[11px] font-semibold text-danger">Giriş hesabı yoxdur</span>}
                  </span>
                  <button type="button" onClick={() => setOpenId(openId === e.id ? null : e.id)} aria-expanded={openId === e.id}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted hover:bg-primary-soft hover:text-primary" title="Giriş hesabı">
                    <KeyRound size={14} />
                  </button>
                  <ConfirmButton onConfirm={() => setStorekeeper(e.id, false)} success={false}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted hover:bg-danger-soft hover:text-danger"
                    title="Depo məsulluğunu götür" question={`${e.full_name} artıq depoda dəyişiklik edə bilməyəcək. Əməkdaş kartı və hesabı silinmir.`} confirmLabel="Bəli, götür">
                    <X size={14} />
                  </ConfirmButton>
                </div>
                {openId === e.id && (
                  <div className="mt-2">
                    <AccountSection employeeId={e.id} email={email} hasAccount={!!e.user_id} enabled={accounts.enabled}
                      note="Hesabla depo məsulu usta panelinə daxil olub Depo bölməsini idarə edir." />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <ToolPicker items={candidates} value={picked} onChange={setPicked} name="employee_id" icon={Users}
          placeholder="Əməkdaş seç..." emptyLabel="Seçiləcək əməkdaş yoxdur" searchLabel="Əməkdaş axtar..." />
        <Button size="sm" disabled={!picked} className="!h-9"
          onClick={async () => { if (picked) { await setStorekeeper(picked, true); setPicked(null); } }}>
          Təyin et
        </Button>
      </div>
    </div>
  );
}
