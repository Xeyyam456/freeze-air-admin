import { useActionState, useState } from "react";
import { returnTool, settleMaterial } from "@/services/depot/assignments";
import { useLoggedUse } from "./useLoggedUse";
import { useOnSuccess } from "@/components/forms";
import type { Holding, PackInfo, Tool } from "@/types/depot";
import { PIECE_MAX } from "../constants/limits";
import { fmt, isPacked, parseQty, pieceWord, round2, showQty } from "../utils/quantity";

// Ustadakını geri almaq / təhvil almaq (HolderRow):
// Alət: "Geri al" (ustada 1 ədəddirsə dərhal, çoxdursa neçə ədəd olduğu soruşulur).
// Material: "Təhvil al": usta nə qədər qaytarır (kq və ya balon) və qalanı işlədib, ya da ustada qalır.
// Qaz: 1 balon (11,3 kq) götürüb 3 kq işlədib → "Qaytarır 8,3 kq", "Qalanı: işlədib" → 3 kq sərf, 8,3 kq açıq balon depoya.
export function useHolderReturn(holding: Holding, tool: Tool | undefined) {
  const unit = tool?.kind === "material" ? tool.unit : "ədəd";
  const material = tool?.kind === "material";
  const pack: PackInfo | null = tool ?? null;
  const packed = isPacked(pack);
  const [asking, setAsking] = useState(false);
  const [retText, setRetText] = useState("");
  const [byPack, setByPack] = useState(false);
  const [restUsed, setRestUsed] = useState(true); // qalanı işlədib (true) və ya ustada qalır (false)
  const typed = parseQty(retText);
  const retBase = round2((Number.isNaN(typed) ? 0 : typed) * (packed && byPack ? pack.pack_size : 1));
  const rest = round2(holding.quantity - retBase);
  const usedBase = restUsed ? Math.max(0, rest) : 0;
  const invalid = retBase < 0 || rest < 0;
  const empty = retBase === 0 && usedBase === 0;
  const logged = useLoggedUse(holding.employee_id, holding.tool_id, holding.taken_at, material && asking);
  const [state, action, pending] = useActionState(
    async (_prev: Awaited<ReturnType<typeof returnTool>>, fd: FormData) => {
      if (material) return settleMaterial(holding.id, usedBase, retBase);
      const qty = Number(fd.get("quantity") ?? holding.quantity);
      if (qty > holding.quantity) return { error: `Ustada cəmi ${holding.quantity} ${unit} var.` };
      return returnTool(holding.id, qty);
    },
    null,
  );
  const resetForm = () => { setAsking(false); setRetText(""); setByPack(false); setRestUsed(true); };
  useOnSuccess(state, resetForm, material ? "Təhvil alındı" : "Geri alındı");

  // Depoya nə qayıdır: qablıda tam balonlar + açıq balon, boruda ≤ 3 metr parça
  const openPart = packed ? round2(retBase - Math.floor(round2(retBase / pack.pack_size)) * pack.pack_size) : 0;
  const retNote = packed ? (openPart > 0 ? ` (${fmt(openPart)} ${unit} ${pieceWord(pack)})` : "")
    : unit.trim().toLowerCase() === "metr" ? (retBase <= PIECE_MAX ? " (parça)" : "") : "";
  const hint = invalid ? `Ustada cəmi ${showQty(holding.quantity, unit, pack)} var.`
    : empty ? "Nə qədər qaytardığını yaz."
    : [
      usedBase > 0 && `işlədib ${fmt(usedBase)} ${unit}`,
      retBase > 0 && `depoya ${fmt(retBase)} ${unit}${retNote}`,
      !restUsed && rest > 0 && `ustada qalır ${fmt(rest)} ${unit}`,
    ].filter(Boolean).join(" · ");

  return {
    unit, material, pack, asking, setAsking, retText, setRetText, byPack, setByPack, restUsed, setRestUsed,
    usedBase, invalid, empty, logged, action, pending, resetForm, hint,
  };
}
