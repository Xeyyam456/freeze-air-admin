// Səhifə məzmunu + sağda sabit panel.
// İki konteyner simmetrikdir: ikisi də header-dən eyni boşluqla başlayır və ekranın altından eyni boşluqla bitir.
// Səhifə sürüşmür; sol konteyner öz içində sürüşür. Panel boşdursa (məs. admin deyilsə), məzmun bütün eni tutur.
// fill: məzmun (məs. xəritə) konteyneri tam doldurur — sürüşmə və aşağıdakı solğunlaşma olmur.
export function WithSidePanel({ panel, fill = false, children }: {
  panel: React.ReactNode | null;
  fill?: boolean;
  children: React.ReactNode;
}) {
  if (!panel) return <>{children}</>;
  return (
    <>
      {/* Xarici qutu: çərçivə və ölçü. Sağda panelin eni + boşluq; hündürlük: ekran − header − yuxarı/aşağı boşluqlar */}
      <div className="mr-[calc(var(--panel-w)+var(--gap))] h-[calc(100vh-var(--header-h)-2*var(--gap))] overflow-hidden rounded-[18px] border border-line bg-[#f8f9fc]">
        {fill ? (
          <div className="h-full p-3">{children}</div>
        ) : (
          /* Daxili sürüşən hissə: aşağı kənarda kartlar kəskin kəsilmir, yumşaq solğunlaşır */
          <div className="h-full overflow-y-auto px-5 pb-12 pt-5 [mask-image:linear-gradient(to_bottom,black_calc(100%-48px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        )}
      </div>
      <aside className="side-panel">{panel}</aside>
    </>
  );
}
