import type { AboutFormProps } from "@/types/site";
import { AboutForm } from "./AboutForm";
import { ImageSlot } from "./ImageSlot";

// Haqqımızda: şəkillər | mətn | siyahı + kart
export function AboutSection({ settings }: AboutFormProps) {
  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="card-title">Haqqımızda</h2>
          <p className="muted mt-1 text-sm">Hero-dan sonrakı bölmə: saytda solda şəkillər və kart, sağda mətn.</p>
        </div>
        <span className="muted rounded-full bg-bg px-3 py-1 text-xs">Şəkillər yüklənən kimi saxlanır, mətnlər “Yadda saxla” ilə</span>
      </div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(300px,1fr)_2fr]">
        <div className="space-y-4">
          <div>
            <span className="label">Böyük şəkil (yuxarıda)</span>
            <ImageSlot field="about_image_main_url" url={settings.about_image_main_url} folder="about" hint="16:9, məs. 1600×900 px." />
          </div>
          <div>
            <span className="label">Kiçik şəkil (kartın yanında)</span>
            <ImageSlot field="about_image_side_url" url={settings.about_image_side_url} folder="about" hint="Kvadrat, məs. 800×800 px." small />
          </div>
        </div>
        <AboutForm key={settings.updated_at} settings={settings} />
      </div>
    </section>
  );
}
