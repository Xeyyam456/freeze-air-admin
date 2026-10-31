import { useState } from "react";
import { toast } from "@/lib/toast";
import { saveFaq } from "@/services/site/content";
import type { FaqEditorProps } from "@/types/site";
import { str } from "../../utils/formText";
import { SortActive } from "../common/SortActive";
import { EditorShell } from "./EditorShell";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

export function FaqEditor({ item, sort, onClose }: FaqEditorProps) {
  const [pending, setPending] = useState(false);

  async function submit(fd: FormData) {
    if (!str(fd, "question") || !str(fd, "answer")) return toast.error("Sual və cavab vacibdir.");
    setPending(true);
    const err = await saveFaq(item?.id ?? null, { question: str(fd, "question"), answer: str(fd, "answer"), sort: Number(fd.get("sort") ?? 0) || 0, is_active: fd.get("is_active") === "on" });
    setPending(false);
    if (err) return toast.error(err);
    onClose();
  }

  return (
    <EditorShell title={item ? "Sualı redaktə et" : "Yeni sual"} onClose={onClose} onSubmit={submit} pending={pending} wide>
      <FormField label="Sual"><Input name="question" defaultValue={item?.question} maxLength={160} required /></FormField>
      <FormField label="Cavab"><Textarea name="answer" defaultValue={item?.answer} maxLength={800} required rows={5} className="resize-none !py-2" /></FormField>
      <SortActive sort={item?.sort ?? sort} active={item?.is_active ?? true} />
    </EditorShell>
  );
}
