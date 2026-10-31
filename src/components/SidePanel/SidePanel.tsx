import { useEffect, useState } from "react";
import { Plus, X, type LucideIcon } from "lucide-react";
import { useNarrow } from "@/lib/navDrawer";

// Səhifə məzmunu + sağda sabit panel.
// İki konteyner simmetrikdir: ikisi də header-dən eyni boşluqla başlayır və ekranın altından eyni boşluqla bitir.
// Səhifə sürüşmür; sol konteyner öz içində sürüşür. Panel boşdursa (məs. admin deyilsə), məzmun bütün eni tutur.
// fill: məzmun (məs. xəritə) konteyneri tam doldurur — sürüşmə və aşağıdakı solğunlaşma olmur.
// Dar ekranda (< 1024px) panel sağda yer tutmur: üzən düymə onu aşağıdan açılan pəncərədə göstərir.
export function WithSidePanel({ panel, fill = false, stack = false, fabLabel = "Əlavə et", fabIcon: FabIcon = Plus, inline = false, narrowTop, narrowPanel, children }: {
  panel: React.ReactNode | null;
  fill?: boolean;
  stack?: boolean; // üst hissə (axtarış, tablar) yerində qalır, məzmun öz bloku içində sürüşür: uşaq `flex h-full flex-col` olmalıdır
  fabLabel?: string; // dar ekranda üzən düymənin yazısı və ikonu
  fabIcon?: LucideIcon;
  narrowTop?: React.ReactNode; // dar ekranda məzmunun ÜSTÜNDƏ adi kart kimi görünən hissə (məs. məlumat kartı); panel isə yalnız narrowPanel olur
  narrowPanel?: React.ReactNode;
  inline?: boolean; // dar ekranda panel üzən düymə əvəzinə məzmunun ÜSTÜNDƏ adi kart kimi görünür (yalnız məlumat kartı olan səhifələr)
  children: React.ReactNode;
}) {
  const narrow = useNarrow();
  const [sheet, setSheet] = useState(false);
  useEffect(() => setSheet(false), [narrow]);
  useEffect(() => {
    if (!sheet) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [sheet]);

  if (!panel) return <>{children}</>;
  const inlinePanel = narrow && inline;
  const split = narrow && narrowTop !== undefined;
  const sheetPanel = split ? (narrowPanel ?? null) : panel;
  return (
    <>
      {inlinePanel && <div className="mb-4">{panel}</div>}
      {split && <div className="mb-4">{narrowTop}</div>}
      {/* Xarici qutu: çərçivə və ölçü. Sağda panelin eni + boşluq; hündürlük: ekran − header − yuxarı/aşağı boşluqlar */}
      <div data-fill={fill || undefined} data-compact={inlinePanel || undefined} className="side-box mr-[calc(var(--panel-w)+var(--gap))] h-[calc(100vh/var(--zoom)-var(--header-h)-2*var(--gap))] overflow-hidden rounded-[18px] border border-line bg-[#f8f9fc]">
        {stack ? (
          <div className="h-full px-5 py-5 max-sm:px-2.5 max-sm:py-3">{children}</div>
        ) : fill ? (
          <div className="h-full p-3">{children}</div>
        ) : (
          /* Daxili sürüşən hissə: aşağı kənarda kartlar kəskin kəsilmir, yumşaq solğunlaşır */
          <div className="h-full overflow-y-auto px-5 pb-12 pt-5 [mask-image:linear-gradient(to_bottom,black_calc(100%-48px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        )}
      </div>
      {narrow && !inline && !!sheetPanel && (
        <>
          <button type="button" className="panel-fab" onClick={() => setSheet(true)}><FabIcon size={18} strokeWidth={2.4} /> {fabLabel}</button>
          {sheet && <div className="panel-backdrop" onClick={() => setSheet(false)} aria-hidden />}
        </>
      )}
      {!inlinePanel && !!sheetPanel && <aside className="side-panel" data-open={sheet || undefined}>
        {narrow && <button type="button" className="panel-close" onClick={() => setSheet(false)} aria-label="Bağla"><X size={18} /></button>}
        {sheetPanel}
      </aside>}
    </>
  );
}
