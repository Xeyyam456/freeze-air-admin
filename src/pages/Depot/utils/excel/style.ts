import type { Hue } from "@/types/depot";

export const NAVY = "#0b1324", INK = "#111827", MUTED = "#667085", LINE = "#dfe5ef", ZEBRA = "#f7f9fc", SUB = "#eef2f8";
export const C = {
  blue: { main: "#2563eb", soft: "#eaf1ff" }, teal: { main: "#0d9488", soft: "#e6f7f5" }, violet: { main: "#7c3aed", soft: "#f2edff" },
  red: { main: "#dc2626", soft: "#fdecec" }, amber: { main: "#d97706", soft: "#fff4e0" }, green: { main: "#16a34a", soft: "#e8f8ee" },
  slate: { main: "#475569", soft: "#f1f4f8" }, navy: { main: "#1f2a44", soft: "#eef1f7" },
};

export const thin = { borderColor: LINE, borderStyle: "thin" as const };
export const base = (i: number) => ({ alignVertical: "center" as const, height: 24, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...thin });
export const txt = (i: number, value: string, extra: Record<string, unknown> = {}) => ({ ...base(i), value, indent: 1, ...extra });
export const num = (i: number, value: number, extra: Record<string, unknown> = {}) =>
  ({ ...base(i), value, type: Number, align: "center" as const, textColor: value ? INK : "#b4bcc9", ...extra });
export const date = (i: number, iso: string | null) =>
  iso ? { ...base(i), value: new Date(iso), type: Date, format: "dd.mm.yyyy", align: "center" as const } : txt(i, "—", { align: "center", textColor: MUTED });
export const time = (iso: string) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
// Rəngli "nişan" xanası: yumşaq fon + qalın rəngli yazı
export const pill = (i: number, value: string, hue: Hue) => ({ ...base(i), value, align: "center" as const, fontWeight: "bold" as const, textColor: C[hue].main, backgroundColor: C[hue].soft });
