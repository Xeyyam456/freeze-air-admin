import type { EditorFieldsProps } from "@/types/errorCodes";
import s from "./CodeEditor.module.css";

// Pultun sahələri: kod (böyük hərflə, LCD-də yanır), açıqlama, edilecək iş.
// Yeni kod bu modeldə artıq varsa, əlavə etmək bağlanır və həmin kodu açmaq təklif olunur.
export function EditorFields({ item, code, onCode, existing, onOpen }: EditorFieldsProps) {
  return (
    <div className={s.fields}>
      <label className={s.field}>
        <span>Xəta kodu</span>
        <input name="code" value={code} onChange={(e) => onCode(e.target.value.toUpperCase())} required maxLength={4}
          autoComplete="off" spellCheck={false} placeholder="Məs. U4" />
      </label>
      {existing && (
        <p className={s.exists}>
          {existing.code} bu modeldə artıq var.
          <button type="button" onClick={() => onOpen(existing)}>Onu aç</button>
        </p>
      )}
      <label className={s.field}>
        <span>Açıqlama</span>
        <textarea name="title" defaultValue={item?.title} required rows={2} placeholder="Xətanın nə demək olduğu" />
      </label>
      <label className={s.field}>
        <span>Edilecək iş</span>
        <textarea name="solution" defaultValue={item?.solution ?? ""} rows={6} placeholder="Usta nə etməlidir, addım-addım" />
      </label>
    </div>
  );
}
