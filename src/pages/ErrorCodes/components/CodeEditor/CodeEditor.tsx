import { Box } from "lucide-react";
import { Button } from "@/shared/components/Button";
import type { CodeEditorProps } from "@/types/errorCodes";
import { EditorForm } from "./EditorForm";
import s from "./CodeEditor.module.css";

// Pult redaktoru: xəritədə seçilən kod redaktə olunur, boş xana və ya "Yeni kod" ilə yenisi yazılır.
// Forma hər kod üçün yenidən qurulur (key), sahələr seçilmiş kodun dəyərləri ilə dolur.
export function CodeEditor({ map }: CodeEditorProps) {
  if (!map.model) {
    return (
      <div className={s.empty}>
        <p>Xəta kodu yazmaq üçün əvvəl kondisioner modelini əlavə et.</p>
        <Button type="button" size="sm" onClick={() => map.setTab("models")}><Box size={14} /> Model əlavə et</Button>
      </div>
    );
  }
  const key = map.selected ? `edit-${map.selected.id}` : `new-${map.model.id}-${map.draft ?? ""}`;
  return <EditorForm key={key} map={map} />;
}
