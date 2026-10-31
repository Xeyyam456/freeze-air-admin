import { useActionState, useState } from "react";
import { Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { updateAbout } from "@/services/site/settings";
import type { AboutFormProps } from "@/types/site";
import { CARD_COLORS } from "../../constants/homeConstants";
import { AboutCardPreview } from "./AboutCardPreview";
import { CardColorPicker } from "./CardColorPicker";

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
        <Field label="Başlıq">
          <input name="about_title" defaultValue={settings.about_title ?? ""} maxLength={120} className="field" />
        </Field>
        <Field label="Mətn (abzasları boş sətirlə ayırın)">
          <textarea name="about_text" defaultValue={settings.about_text ?? ""} maxLength={1500} rows={9} className="field resize-y !py-2" />
        </Field>
        <Field label="Siyahı (hər sətir bir bənd)">
          <textarea name="about_points" defaultValue={settings.about_points ?? ""} maxLength={500} rows={3} className="field resize-y !py-2" />
        </Field>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kart: başlıq">
            <input name="about_card_title" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} maxLength={60} className="field" />
          </Field>
          <Field label="Kart: alt yazı">
            <input name="about_card_text" value={cardText} onChange={(e) => setCardText(e.target.value)} maxLength={80} className="field" />
          </Field>
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
