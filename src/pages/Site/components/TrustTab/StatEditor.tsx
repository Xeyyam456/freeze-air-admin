import { useState } from "react";
import { Field } from "@/components/forms";
import { toast } from "@/lib/toast";
import { saveStat } from "@/services/site/content";
import type { StatEditorProps } from "@/types/site";
import { str } from "../../utils/formText";
import { SortActive } from "../common/SortActive";
import { EditorShell } from "./EditorShell";
import { Input } from "@/shared/components/Input";

export function StatEditor({ item, sort, onClose }: StatEditorProps) {
  const [pending, setPending] = useState(false);

  async function submit(fd: FormData) {
    if (!str(fd, "value") || !str(fd, "label")) return toast.error("Rəqəm və yazı vacibdir.");
    setPending(true);
    const err = await saveStat(item?.id ?? null, { value: str(fd, "value"), label: str(fd, "label"), sort: Number(fd.get("sort") ?? 0) || 0, is_active: fd.get("is_active") === "on" });
    setPending(false);
    if (err) return toast.error(err);
    onClose();
  }

  return (
    <EditorShell title={item ? "Rəqəmi redaktə et" : "Yeni rəqəm"} onClose={onClose} onSubmit={submit} pending={pending}>
      <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
        <Field label="Rəqəm"><Input name="value" defaultValue={item?.value} maxLength={12} required placeholder="200+" /></Field>
        <Field label="Yazı"><Input name="label" defaultValue={item?.label} maxLength={40} required placeholder="Mağaza və filial" /></Field>
      </div>
      <p className="muted -mt-1 text-xs">Rəqəm sayğacla artır; “200+”, “5 il”, “24/7” kimi yazmaq olar (başdakı rəqəmlər sayılır, qalanı olduğu kimi qalır).</p>
      <SortActive sort={item?.sort ?? sort} active={item?.is_active ?? true} />
    </EditorShell>
  );
}
