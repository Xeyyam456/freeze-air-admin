// Depo: yazma yetkisi adminlərdə və depo məsulundadır (bazada can_manage_tools(), 0084).
// Say birbaşa dəyişmir: Mədaxil, Silinmə aktı və Sayım sənədləri təsdiqdən sonra işləyir (depot_decide).
// Say qaydaları da bazadadır: depoda olandan çox vermək, ustalardakından az say yazmaq olmur.
// Bazanın xəta mətnləri Azərbaycan dilindədir, olduğu kimi göstərilir.
// Keçid barrel-i: köhnə böyük fayllar bölünənə qədər; yeni kod birbaşa fayldan import etsin.
export { giveTool, givePiece, giveTools, returnAllTools, returnTool, settleMaterial } from "./assignments";
export { createReceipt, createWriteoff, decideRequest } from "./documents";
export { depotFileUrl } from "./files";
export { finishRepair, sendRepair } from "./repairs";
export { addTool, deleteTool, updateTool } from "./tools";
export type { WriteoffReason } from "@/types/depot";
