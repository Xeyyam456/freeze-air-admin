import { PackagePlus, Warehouse } from "lucide-react";
import { Button } from "@/shared/components/Button";
import type { DepotBoardProps } from "@/types/depot";
import { useDepotBoard } from "../../hooks/useDepotBoard";
import { BoardHeader } from "../BoardHeader";
import { BoardHome } from "../BoardHome";
import { IconTile } from "../IconTile";
import { PeopleTable } from "../PeopleTable";
import { PersonModal } from "../PersonModal";
import { QuickGiveModal } from "../QuickGiveModal";
import { ToolModal } from "../ToolModal";
import { ToolsTable } from "../ToolsTable";

// Depo lövhəsi (2026-10-23 sadələşdirilib; istifadəçi: "çox qəlizdir, uşaq belə rahat istifadə edə bilməlidir").
// Üç böyük tab (Alətlər / Materiallar / Ustalar) + axtarış + sadə siyahı (hər alət bir sətir; ayrıca kartlar "kobud" göründü):
// ad, depoda nə qədər, ustalarda, "Ver". Sətrə basanda alətin pəncərəsi (Kimdədir, Mədaxil, Silinmə...), ustaya basanda ustanın pəncərəsi açılır.
// Süzgəc çipləri, sıralama, cədvəl, toplu seçim və QR etiket istifadəçi istəyi ilə çıxarılıb: yenidən əlavə etmə.
export function DepotBoard(props: DepotBoardProps) {
  const { tab, onTab, tools, pieces, employees, requests, repairs, losses = [], canManage, onOpenTool, onReceipt, onShopping, onJournal } = props;
  const b = useDepotBoard(props);
  const { open, quick, person, openPerson, kind } = b;

  return (
    <div className="space-y-4">
      {quick && quick.available > 0 && <QuickGiveModal tool={quick} employees={employees} onClose={() => b.setQuickId(null)} />}
      {open && (
        <ToolModal tool={open} holders={b.byTool[open.id] ?? []} pieces={pieces.filter((p) => p.tool_id === open.id)}
          repairs={repairs.filter((r) => r.tool_id === open.id)} losses={losses.filter((l) => l.tool_id === open.id)} requests={requests} employees={employees} canManage={canManage}
          onReceipt={() => onReceipt(open)} onClose={() => onOpenTool(null)} />
      )}
      {openPerson && person && (
        <PersonModal emp={openPerson} kind={person.kind} holds={b.byEmployee[openPerson.id] ?? []}
          toolInfo={b.toolInfo} tools={tools} requests={requests} canManage={canManage} onClose={() => b.setPerson(null)} />
      )}

      {tab === "home" ? <BoardHome b={b} onTab={onTab} onShopping={onShopping} onJournal={onJournal} /> : (
        <div className="rounded-3xl border border-line bg-surface">
          <BoardHeader b={b} tab={tab} onTab={onTab} />
          {/* Cədvəl (istifadəçi seçimi: "Cədvəl (pro)"): başlıq kartının içində, sütun başlıqları sürüşmədə yapışıq */}
          {tab === "people" ? <PeopleTable b={b} /> : b.counts[kind] === 0 ? (
            <div className="border-t border-line py-14 text-center">
              <span className="mx-auto block w-fit"><IconTile icon={Warehouse} tone="slate" /></span>
              <p className="mt-3 font-semibold">Hələ {kind === "material" ? "material" : "alət"} yoxdur</p>
              {canManage && <Button onClick={() => onReceipt(null)} className="mx-auto mt-4"><PackagePlus size={16} /> Mədaxil</Button>}
            </div>
          ) : b.shown.length === 0 ? (
            <p className="muted border-t border-line py-10 text-center text-sm">Heç nə tapılmadı.</p>
          ) : <ToolsTable b={b} losses={losses} canManage={canManage} onOpenTool={onOpenTool} />}
        </div>
      )}
    </div>
  );
}
