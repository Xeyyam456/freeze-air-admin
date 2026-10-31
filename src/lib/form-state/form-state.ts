import type { FormState } from "@/types/shared";

export function text(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export function dbError(error: { code: string; message: string }, duplicate: string): FormState {
  return { error: error.code === "23505" ? duplicate : error.message };
}
