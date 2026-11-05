import { useCallback, useState } from "react";
import { WithSidePanel } from "@/components/SidePanel";
import { useNarrow } from "@/lib/navDrawer";
import type { ErrorCode, ErrorCodesScreenProps } from "@/types/errorCodes";
import { useBackClose } from "../../hooks/useBackClose";
import { useErrorCodeMap } from "../../hooks/useErrorCodeMap";
import { CodeMap } from "../CodeMap";
import { ErrorCodePanel } from "../ErrorCodePanel";

// Səhifənin gövdəsi: solda kod xəritəsi, sağda pult redaktoru (Excel, Modellər tabları da orada).
// Dar ekranda panel aşağıdan açılır: xəritədə kod seçiləndə özü açılır, "geri" düyməsi onu bağlayır.
export function ErrorCodesScreen({ data, admin }: ErrorCodesScreenProps) {
  const map = useErrorCodeMap(data);
  const narrow = useNarrow();
  const [sheet, setSheet] = useState(false);
  const closeSheet = useBackClose(sheet && narrow, useCallback(() => setSheet(false), []));

  const open = () => narrow && admin && setSheet(true);
  const pick = (c: ErrorCode) => {
    map.select(c);
    open();
  };
  const create = (code: string) => {
    map.create(code);
    open();
  };

  return (
    <WithSidePanel
      stack
      fabLabel="Kod yaz"
      sheetOpen={sheet}
      onSheet={(v) => (v ? setSheet(true) : closeSheet())}
      panel={admin ? <ErrorCodePanel data={data} map={map} /> : null}
    >
      <CodeMap map={map} onPick={pick} onCreate={admin ? create : () => {}} />
    </WithSidePanel>
  );
}
