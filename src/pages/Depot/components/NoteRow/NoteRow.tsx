import { Paperclip, X } from "lucide-react";
import { Input } from "@/shared/components/Input";

// Qeyd + 📎 (qaimə və ya şəkil, istəyə görə) bir sətirdə
export function NoteRow({ note, onNote, file, onFile, placeholder = "Qeyd (istəyə görə)", required = false }: {
  note?: string; onNote?: (v: string) => void; file: File | null; onFile: (f: File | null) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <div className="flex gap-2">
        <Input name="note" value={note} onChange={onNote ? (e) => onNote(e.target.value) : undefined} required={required} placeholder={placeholder}
          autoComplete="off" className="min-w-0 flex-1 max-sm:!h-8 max-sm:!text-xs" />
        <label className={`icon-btn !h-11 !w-11 max-sm:!h-8 max-sm:!w-8 shrink-0 cursor-pointer border border-line ${file ? "!text-primary" : ""}`} title="Qaimə və ya şəkil əlavə et">
          <Paperclip size={16} />
          <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      {file && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs">
          <Paperclip size={12} className="text-muted" /><span className="min-w-0 truncate">{file.name}</span>
          <button type="button" onClick={() => onFile(null)} className="text-muted hover:text-danger" aria-label="Faylı götür"><X size={12} /></button>
        </p>
      )}
    </div>
  );
}
