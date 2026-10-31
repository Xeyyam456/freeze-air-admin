import { Snowflake } from "lucide-react";
import { FEATURES } from "../constants/features";

// Sol: tünd marka hissəsi (yalnız ≥ 1024)
export function LoginBrand() {
  return (
    <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#091428,#10233a_55%,#134152)] p-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-frost/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
      <Snowflake size={420} strokeWidth={0.6} className="pointer-events-none absolute -bottom-24 -right-20 text-white/[0.05]" aria-hidden="true" />

      <div className="relative flex items-center gap-3">
        <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
        <span className="text-lg font-extrabold">Freeze Air Service</span>
      </div>

      <div className="relative max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-frost backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-frost" /> Admin paneli
        </span>
        <h1 className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight">
          Bütün idarəetmə <span className="bg-gradient-to-r from-white to-frost bg-clip-text text-transparent">bir paneldə</span>
        </h1>
        <ul className="mt-10 space-y-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-frost shadow-[0_8px_20px_rgba(10,126,164,0.4)]">
                <Icon size={19} />
              </span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="block text-sm text-white/65">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/40">© Freeze Air Service</p>
    </section>
  );
}
