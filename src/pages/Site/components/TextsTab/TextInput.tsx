import { Label } from "@/shared/components/Label";
import { Textarea } from "@/shared/components/Textarea";
import { Input } from "@/shared/components/Input";
import { RotateCcw } from "lucide-react";
import type { TextInputProps } from "@/types/site";

export function TextInput({ field, value, dirty, onChange, onReset }: TextInputProps) {
  const multi = field.kind === "text" || field.kind === "list";
  return (
    <label className={`block ${multi ? "md:col-span-2" : ""}`}>
      <Label className="flex items-center gap-2">
        {field.label}
        {field.kind === "list" && <span className="muted font-normal">(hər sətir bir bənd)</span>}
        {dirty && (
          <button type="button" onClick={(e) => { e.preventDefault(); onReset(); }} title="Dəyişikliyi geri al"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <RotateCcw size={12} /> geri al
          </button>
        )}
      </Label>
      {multi ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={2000}
          rows={field.kind === "list" ? Math.max(3, value.split("\n").length) : 3}
          className={`resize-y !py-2 ${dirty ? "!border-frost" : ""}`} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} maxLength={300}
          className={`${dirty ? "!border-frost" : ""}`} />
      )}
    </label>
  );
}
