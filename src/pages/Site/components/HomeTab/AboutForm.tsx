import { useActionState, useState } from "react";
import { Buttons, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { updateAbout } from "@/services/site/settings";
import type { AboutFormProps } from "@/types/site";
import { CARD_COLORS } from "../../constants/homeConstants";
import { AboutCardPreview } from "./AboutCardPreview";
import { CardColorPicker } from "./CardColorPicker";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// key (HomeTab-da): saxlandıqdan sonra sahələr bazadakı yeni dəyərlərlə yenilənsin
export function AboutForm({ settings }: AboutFormProps) {
  const [state, action, pending] = useActionState(updateAbout, null);
  useOnSuccess(state, undefined, "Haqqımızda mətni yadda saxlanıldı");
  const [cardTitle, setCardTitle] = useState(settings.about_card_title ?? "");
  const [cardText, setCardText] = useState(settings.about_card_text ?? "");
  const [color, setColor] = useState(settings.about_card_color);

  return (
    <SaveConfirmForm action={action} className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <FormField label="Başlıq">
          <Input name="about_title" defaultValue={settings.about_title ?? ""} maxLength={120} />
        </FormField>
        <FormField label="Mətn (abzasları boş sətirlə ayırın)">
          <Textarea name="about_text" defaultValue={settings.about_text ?? ""} maxLength={1500} rows={9} className="resize-y !py-2" />
        </FormField>
        <FormField label="Siyahı (hər sətir bir bənd)">
          <Textarea name="about_points" defaultValue={settings.about_points ?? ""} maxLength={500} rows={3} className="resize-y !py-2" />
        </FormField>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Kart: başlıq">
            <Input name="about_card_title" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} maxLength={60} />
          </FormField>
          <FormField label="Kart: alt yazı">
            <Input name="about_card_text" value={cardText} onChange={(e) => setCardText(e.target.value)} maxLength={80} />
          </FormField>
        </div>
        <CardColorPicker color={color} onColor={setColor} />
        <AboutCardPreview title={cardTitle} text={cardText} color={CARD_COLORS.find((x) => x.id === color) ?? CARD_COLORS[0]} />
        <div className="mt-auto">
          <Buttons pending={pending} label="Yadda saxla" />
        </div>
      </div>
    </SaveConfirmForm>
  );
}
