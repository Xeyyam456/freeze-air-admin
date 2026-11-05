import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm } from "@/shared/components/ActionForm";
import { Button } from "@/shared/components/Button";
import { SaveConfirmForm } from "@/shared/components/SaveConfirmForm";
import { useOnSuccess } from "@/shared/hooks/useOnSuccess";
import { addErrorCode, deleteErrorCode, updateErrorCode } from "@/services/errorCodes/codes";
import type { CodeEditorProps } from "@/types/errorCodes";
import { SegmentDisplay } from "../SegmentDisplay";
import { EditorFields } from "./EditorFields";
import s from "./CodeEditor.module.css";

// Bir kodun forması: LCD ekranda yazılan kod yanır. Redaktədə "Yadda saxla" təsdiq soruşur; yenidə dərhal əlavə olunur.
export function EditorForm({ map }: CodeEditorProps) {
  const item = map.selected;
  const model = map.model!;
  const [code, setCode] = useState(item?.code ?? map.draft ?? "");
  const [state, action, pending] = useActionState(item ? updateErrorCode.bind(null, item.id) : addErrorCode, null);
  useOnSuccess(state, () => !item && map.reset(), item ? "Yadda saxlanıldı" : "Xəta kodu əlavə edildi");

  const up = code.trim().toUpperCase();
  const existing = !item && up ? map.codes.find((c) => c.code === up) ?? null : null;
  const Form = item ? SaveConfirmForm : ActionForm;

  return (
    <Form action={action} className={s.root}>
      <div className={s.glass}>
        <span className={s.model}>{model.name}</span>
        <span className={s.mode}>{item ? "Redaktə" : "Yeni kod"}</span>
        <SegmentDisplay text={up} />
      </div>
      <input type="hidden" name="model_id" value={model.id} />
      <EditorFields item={item} code={code} onCode={setCode} existing={existing} onOpen={map.select} />

      <div className={s.actions}>
        <Button type="submit" disabled={pending || !!existing} className="min-w-0 flex-1">
          {pending ? "Gözləyin..." : item ? "Yadda saxla" : "Əlavə et"}
        </Button>
        {item && (
          <>
            <Button type="button" variant="glass" onClick={map.reset} title="Yeni kod yaz"><Plus size={16} /> Yeni</Button>
            <ConfirmButton variant="glass" className={s.delete} title="Sil" success={false}
              question={`"${item.code}" xəta kodu silinəcək.`}
              onConfirm={async () => { await deleteErrorCode(item.id); map.reset(); }}>
              <Trash2 size={16} />
            </ConfirmButton>
          </>
        )}
      </div>
    </Form>
  );
}
