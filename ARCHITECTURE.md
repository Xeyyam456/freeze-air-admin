# Arxitektura — Admin paneli (Vite + React)

Qəlib: `github.com/Xeyyam456/TikTak-Project-Admin-Panel`. Köçürmə domen-domen gedir (irəliləyiş: kökdə `REFACTOR-PLAN.md`); köhnə qovluqlar (`components/`, `actions/`, `lib/`) boşalana qədər yeni ilə yanaşı yaşayır.

## Əsas qaydalar
1. **Hər kod faylı ən çox 100 sətir** (`.ts`, `.tsx`, `.mjs`). CSS faylları istisnadır. Yoxlama: `npm run check:lines`.
2. **Bir fayl — bir iş.** Bir komponent, bir hook, bir servis funksiyaları qrupu, bir tip.
3. **Görünüş və davranış dəyişmir.** Refaktor yalnız struktur dəyişikliyidir.
4. **Admin və web arasında ortaq paket yoxdur**: repolar ayrıdır, bir-birinə bağlı deyil; ortaq fayl yoxdur, başlanğıcda kopyalanan fayllar sonra ayrı yaşayır.

## Qovluq xəritəsi
```
src/
  app/                    App.tsx, main.tsx, marşrutlar (routes/)
  layouts/                AdminLayout (Sidebar + Header + Outlet)
  pages/<Domen>/
    index.tsx             səhifə: yalnız hissələri yığır
    components/<Hissə>/   Hissə.tsx + index.ts (lazım olsa öz components/ hooks/)
    hooks/                useXPage.ts — pəncərə/forma/seçim vəziyyəti
    queries/              useXData.ts (useQuery), useXMutations.ts (yazma + revalidate)
    constants/  utils/
    styles/               X.module.css
  shared/
    components/<Ad>/      Ad.tsx + Ad.module.css + index.ts (Button, FormInput, Modal...)
    hooks/                usePref, useData, useDebounce...
    utils/                tarix, format, excel, fetchAll...
  services/<domen>/       yalnız Supabase sorğuları (xService.ts; böyükdürsə bir neçə fayl)
  types/<domen>/<Tip>.ts  bir faylda bir tip, fayl adı = tip adı, qovluqda index.ts barrel
  types/database/         Supabase tipləri (avtomatik bölünür, əl ilə dəyişmə)
  styles/                 index.css: yalnız tokenlər, baza, sıfırlama
```

## Qatlar (kim kimi çağırır)
`pages` → `queries`/`hooks` → `services` → Supabase. Komponent `supabase.from(...)` çağırmır; sorğu yalnız `services/`-dədir.
`shared/` heç vaxt `pages/`-dən import etmir. Domenlər bir-birinin `components/`-ini birbaşa götürmür; ortaq olan `shared/`-ə çıxır.

## Tiplər
- `interface`/`type` yalnız `types/` altında; komponentin `Props` tipi də (`types/depot/DepotBoardProps.ts`).
- Baza sətirləri: `Tables<'work_logs'>` (`@/types/database`), domen tipi ondan törədilir.
- Import: həmişə `import type`.

## Importlar
- Komponentlər birbaşa yoldan: `@/shared/components/Button` (böyük barrel yox, dev və bundle yavaşlamasın).
- Tiplər barrel-dən: `@/types/depot` (tiplər qurmada silinir, zərəri yoxdur).
- Domen daxilində nisbi yol (`./components/X`), domendən kənarda `@/`.

## Stil
- Hər komponentin öz `X.module.css`-i; qlobal class yalnız `styles/index.css`-də (tokenlər: rənglər, radius, kölgə, `--header-h`).
- Rəng/ölçünü kodda yazma, CSS dəyişənini işlət.

## Data
- Oxu: `useData(açar, fetcher, deps)` (TanStack Query); açarlar domenin `queries/keys.ts`-indədir.
- Yazdıqdan sonra `revalidate(...açarlar)`. Supabase 1000 sətir həddi: ay/il sorğuları `fetchAll` ilə.

## Admin ↔ web kopyaları
- `src/shared/**` və `src/types/shared/**` hər repoda öz kopyasıdır. Sinxron skript YOXDUR: bir repoda dəyişiklik digərinə avtomatik getmir, lazımdırsa əl ilə köçürülür.
- Skript hook/portal/hadisə işlədən `.tsx`-ə `"use client"` əlavə edir; qalanı (Button, Input) server komponentində də işləyir.

## Keçid dövrü (CSS)
- `Button`, `Input`, `Textarea`, `Select`, `FormField`, `Card` stilləri `shared/styles/*.module.css`-dədir. Düymə/sahə/etiket görünüşü başqa elementdə lazımdırsa `buttonClass()`, `<Card as="li" link>`, `<CardTitle as="h3">`, `<IconButton>` (polimorf: `as="label"`; ConfirmButton: `icon danger`), `<Button as="a" variant size>` (ConfirmButton: `variant size`), `iconTileClass()`, `codeBadgeClass()`, `tableWrapClass()`, `segClass()`, `searchClass()`, `plateClass()`, `heroActionClass()`, `logoMarkClass()` işlət (xam `btn`, `field`, `label`, `card` class-ı yazma). Sahə etiketi `<Label>`, açılan siyahı tetikləyicisi `<FieldButton>`. `Modal` stili `shared/styles/Modal.module.css`-dədir.
- `.module.css`-ə köçəndə qaydaları `@layer components { ... }` içində yaz: qatsız CSS Tailwind utility-lərini (`className="w-full"`) üstələyir.
- **Stil faylı yeri**: komponent qovluğunda yalnız `X.tsx` + `index.ts` varsa CSS onun yanında durur (`AppHeader/AppHeader.module.css`). Qovluqda `components/`, `hooks/`, `utils/` kimi alt qovluqlar varsa CSS `styles/` qovluğunda (`<Feature>/styles/<Komponent>.module.css`, ad komponentlə eyni, TikTak qəlibi). Ortaq komponentlərin CSS-i `shared/styles/`. İmport: `import s from "…/X.module.css"`, `className={s.root}`.
- **Qlobal marker class**: `side-panel` qlobal qalır (`SidePanel` modulundakı `panel` ilə yanaşı), çünki `Card`, `Field`, `Button` modulları `:global(.side-panel)` ilə yan paneldəki görünüşü dəyişir.
- **Hər modulun ilk sətri** `@layer theme, base, components, utilities;` olmalıdır (sonra `@layer components { ... }`). Bunsuz modul Tailwind-dən əvvəl yüklənəndə `components` qatı `base`-dən (preflight: `padding:0; border-radius:0`) əvvələ düşür və stil itir.
- Animasiya adı modulda lokaldır: `@keyframes`-i həmin faylda yaz (`:global(...)` animation dəyərində işləmir).

## Ortaq UI komponentləri (2026-10-31)
- Xam `<button className="btn ...">`, `<input|textarea|select className="field">`, `<div className="card">` yazma: `Button` (`variant`: primary, secondary, soft, danger, cancel, glass, plain; `size="sm"`), `Input`, `Textarea`, `Select`, `Card` (`as="section"`), `FormField` işlət (`@/shared/components/...`). Rəngi yerli class-lar verirsə `variant="plain"`.
- Düymə/sahə üçün ortaq komponent yoxdursa əvvəl `shared/components`-ə əlavə et, sonra işlət.
- Feature qovluğunun kökündə yalnız `index.tsx`: `components/<Hissə>/`, `hooks/`, `utils/` alt qovluqları.
