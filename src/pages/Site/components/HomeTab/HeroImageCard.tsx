import { CircleCheck } from "lucide-react";
import type { HomeCardProps } from "@/types/site";
import { ImageSlot } from "./ImageSlot";
import { Card } from "@/shared/components/Card";

const NOTES = [
  "Şəkil bütün ekranı örtür; ekran nisbətinə görə aşağı hissəsi kəsilə bilər.",
  "Şəklin sol tərəfi mətn oxunsun deyə tündləşdirilir.",
  "Kondisionerin üstündə saytda hava axını animasiyası oynayır.",
  "Şəkil yoxdursa, saytda tünd mavi fon görünür.",
];

// Hero: saytdakı kimi tam enli fon şəkli, soldan tünd keçid, üstündə başlıq və sürətli forma
export function HeroImageCard({ settings, t }: HomeCardProps) {
  return (
    <Card as="section">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="card-title">Hero şəkli</h2>
          <p className="muted mt-1 text-sm">Saytın ən üstündə bütün ekranı tutan fon şəkli. Solda mətn və forma durur: kondisioner və vacib detal sağ yuxarıda olsun.</p>
        </div>
        <span className="muted rounded-full bg-bg px-3 py-1 text-xs">Tövsiyə: 16:9, 1920×1080 px</span>
      </div>
      <div className="mt-4 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-[#06192b] via-[#0b3a5c] to-[#00a3d9]">
          {settings.hero_image_url && <img src={settings.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />}
          <span className="absolute inset-0 bg-gradient-to-r from-[#06192b]/90 via-[#06192b]/60 to-[#06192b]/10" />
          <div className="absolute inset-y-0 left-0 flex w-3/5 flex-col justify-center gap-2 p-5 text-white">
            <span className="h-1.5 w-16 rounded-full bg-white/30" />
            <span className="text-lg font-extrabold leading-tight">{t["home.hero.title"] ?? "Kondisioner təmiri və servisi"}</span>
            <span className="h-1.5 w-4/5 rounded-full bg-white/25" />
            <span className="mt-1 flex gap-1 rounded-xl bg-white/10 p-1 ring-1 ring-white/20">
              <span className="h-5 flex-1 rounded-md bg-white" /><span className="h-5 flex-1 rounded-md bg-white" /><span className="h-5 w-12 rounded-md bg-[#ff9f1c]" />
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <ul className="space-y-2.5 text-sm">
            {NOTES.map((x) => (
              <li key={x} className="flex gap-2"><CircleCheck size={16} className="mt-0.5 shrink-0 text-primary" /> <span className="muted">{x}</span></li>
            ))}
          </ul>
          <ImageSlot field="hero_image_url" url={settings.hero_image_url} folder="hero" hideImage hint="" />
        </div>
      </div>
    </Card>
  );
}
