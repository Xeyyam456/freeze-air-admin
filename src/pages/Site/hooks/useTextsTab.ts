import { useState } from "react";
import { useData } from "@/lib/useData";
import { toast } from "@/lib/toast";
import { fetchAllTexts } from "@/services/site/fetchSite";
import { saveTexts } from "@/services/site/texts";
import { TEXT_GROUPS } from "../constants/textGroups";

// Mətnlər tabının vəziyyəti: seçilmiş qrup, qaralama (yalnız dəyişənlər), saxlama
export function useTextsTab() {
  const saved = useData("site-texts", fetchAllTexts);
  const [group, setGroup] = useState(TEXT_GROUPS[0].id);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const current = TEXT_GROUPS.find((g) => g.id === group)!;
  const changed = saved ? Object.keys(draft).filter((k) => draft[k] !== (saved[k] ?? "")) : [];
  const changedIn = (id: string) =>
    TEXT_GROUPS.find((g) => g.id === id)!.sections.some((s) => s.fields.some((f) => changed.includes(f.key)));

  const valueOf = (key: string) => draft[key] ?? saved?.[key] ?? "";
  const setValue = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const resetKey = (key: string) => setDraft((d) => { const n = { ...d }; delete n[key]; return n; });

  async function save() {
    setPending(true);
    const err = await saveTexts(Object.fromEntries(changed.map((k) => [k, draft[k]])));
    setPending(false);
    if (err) return toast.error(err);
    setDraft({});
    toast.success("Yadda saxlanıldı", "Saytda ən gec 1 dəqiqəyə görünəcək.");
  }

  return { loaded: saved !== null, group, setGroup, current, changed, changedIn, valueOf, setValue, resetKey, clear: () => setDraft({}), save, pending };
}
