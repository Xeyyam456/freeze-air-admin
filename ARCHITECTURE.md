# Arxitektura — Admin paneli (Vite + React)

Qəlib: `github.com/Xeyyam456/TikTak-Project-Admin-Panel`. Köçürmə domen-domen gedir (irəliləyiş: kökdə `REFACTOR-PLAN.md`); köhnə qovluqlar (`components/`, `actions/`, `lib/`) boşalana qədər yeni ilə yanaşı yaşayır.

## Əsas qaydalar
1. **Hər kod faylı ən çox 100 sətir** (`.ts`, `.tsx`, `.mjs`). CSS faylları istisnadır. Yoxlama: `npm run check:lines`.
2. **Bir fayl — bir iş.** Bir komponent, bir hook, bir servis funksiyaları qrupu, bir tip.
3. **Görünüş və davranış dəyişmir.** Refaktor yalnız struktur dəyişikliyidir.
4. **Admin və web arasında ortaq paket yoxdur**: repolar ayrıdır, eyni fayllar kopyadır (sinxron skriptlə).

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
