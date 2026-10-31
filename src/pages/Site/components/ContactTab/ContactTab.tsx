import { useState } from "react";
import { useData } from "@/lib/useData";
import { fetchSettings } from "@/services/site/fetchSite";
import type { ContactEditorProps, ContactValues } from "@/types/site";
import { ContactForm } from "./ContactForm";
import { ContactPreview } from "./ContactPreview";
import { Card } from "@/shared/components/Card";

// Əlaqə məlumatları: header, footer, ana səhifə, Əlaqə və xidmət səhifələrində göstərilir
export function ContactTab() {
  const settings = useData("site-settings-contact", fetchSettings);

  if (!settings) return <Card className="muted">Yüklənir...</Card>;
  // key: saxlandıqdan sonra sahələr bazadakı yeni dəyərlərlə yenilənsin
  return <ContactEditor key={settings.updated_at} settings={settings} />;
}

function ContactEditor({ settings }: ContactEditorProps) {
  const [values, setValues] = useState<ContactValues>({
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    hours: settings.hours ?? "",
    instagram_url: settings.instagram_url ?? "",
    facebook_url: settings.facebook_url ?? "",
  });

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
      <ContactForm settings={settings} values={values} onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))} />
      <ContactPreview values={values} />
    </div>
  );
}
