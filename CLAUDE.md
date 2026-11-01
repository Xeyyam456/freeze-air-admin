# CLAUDE.md — Freeze Air Service: Admin paneli (Vite)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ünsiyyət
- Hər şey Azərbaycan dilində: cavablar, izahlar, kod şərhləri. Kod, identifikatorlar, texniki terminlər olduğu kimi.
- Qısa, birbaşa. İstifadəçi ilə məcburi razılaşma yoxdur: səhvi açıq de, səbəbini qısa izah et, daha yaxşı variant təklif et.
- İstifadəçi "etmə, hələlik cavab ver" deyəndə yalnız cavab ver, kod yazma.

## Arxitektura qaydaları (DAİMİ — hər yeni xüsusiyyət və düzəliş üçün; 2026-10-28)
- **Kod yazmazdan əvvəl `ARCHITECTURE.md`-ni oxu.** Qovluq quruluşu, qatlar, tiplər, stil, importlar oradadır. Layihə daim yeni xüsusiyyətlərlə böyüyəcək: yeni kod həmişə bu qaydalarla yazılır, köhnə qəlibə (böyük fayl, komponentdə `supabase.from`, inline tip, qlobal CSS) qayıtma.
- **Hər kod faylı max 100 sətir** (CSS xaric). `npm run check:lines`: yeni fayl 100-ü keçə bilməz, köhnə uzun fayl (`scripts/lines-baseline.json`) böyüyə bilməz — ona toxunursansa, böl. Bölüb bitirəndə `npm run check:lines -- --update-baseline`. Kök repoda pre-commit hook (`.githooks/pre-commit`) bunu yoxlayır; yeni kompüterdə bir dəfə `git config core.hooksPath .githooks`.
- Refaktorun irəliləyişi: kökdə `REFACTOR-PLAN.md` (yeni sessiyada oradan davam et).

## Ətraflı sənədlər (`docs/`, lazım olanda oxu)

- `docs/pages.md`: Panel, Xəta kodları, Tapşırıqlar, Görülən işlər, Depo, Sayt səhifəsi, `lib/`, `actions/`, `components/` təsviri.
- `docs/database.md`: Cədvəllər, funksiyalar, yetkilər, storage, realtime, `0001–0095` miqrasiyaların xülasəsi, hesablar.
- `docs/history.md`: 2026-10-24–30 responsivlik, depo mobil cilası, canlı bildirişlər (bitmiş iş, qərarlar).
- `ARCHITECTURE.md`: qovluq quruluşu, qatlar, stil və komponent qaydaları (kod yazmazdan əvvəl oxu).
- Kökdə `REFACTOR-PLAN.md`: refaktorun irəliləyişi.

## Sistem haqqında (iki repo, bir baza)
Kondisioner servis şirkəti **Freeze Air Service** üçün sistem: ustalar, müqavilə bağlanan şirkətlər (filialları) və marketlər (mağazaları), alətlər (depo), ustaların gündəlik iş qeydləri, rəhbərlik, açıq sayt.

| Repo | Nədir | Kim üçün | Port |
|---|---|---|---|
| **admin** (bu repo) | Vite 8 + React 19 + React Router 8 SPA | adminlər və rəhbərlik: hər şeyi idarə edir, saytın məzmununu da | 5173 |
| **web** (ayrı repo) | Next.js 16 | açıq sayt (qonaq) + usta paneli (baxış, yalnız öz işləri) | 3000 |

İkisi də **eyni Supabase layihəsini** işlədir. `supabase/` qovluğu (miqrasiyalar + Edge Function) **bu (admin) reposuna aiddir**; web-də baza dəyişikliyi lazım olanda miqrasiya burada yazılır.

## Layihə strukturu, git və iş qaydaları (admin və web fayllarında eynidir)
- **Qovluqlar** (`D:\Praqramlasirma\Projects\kondisioner-servis\`): `admin/` (Vite, 5173), `web/` (Next.js, 3000), `supabase/` (miqrasiyalar `0001`–`0095`, hamısı bazada tətbiq olunub + Edge Function `admin-accounts`; repolar ayrılanda `admin/supabase/`-a köçürüləcək), `excel/` (test və import faylları, heç bir repoya aid deyil, git-ignore). **Kökdə CLAUDE.md yoxdur**: hər platformanın öz faylı tamdır, işlədiyin platformanın qovluğundan başla (`admin/CLAUDE.md` və ya `web/CLAUDE.md`).
- **Yeni kompüterdə qurmaq**: `git clone https://github.com/Xeyyam456/kondisioner-servis.git`; `admin/` və `web/`-də `npm install`; hər qovluqda `.env.example`-ı `.env.local` adı ilə kopyala və publishable açarı doldur (Supabase → Project Settings → API); `npm run dev`. Gizli (service role) açar lokalda lazım deyil. Baza və Edge Function Supabase-dədir (kopyalanmır).
- **Git**: hələlik **bir repo** (kök, budaq `main`): `admin/`, `web/`, `supabase/` birlikdə commit və push olunur, sonda ayrılacaq (məs. `git subtree split --prefix=admin`). **Ayrı deploy repoları** (2026-10-19): `web/` → `github.com/Xeyyam456/freeze-air-web`, `admin/` → `github.com/Xeyyam456/freeze-air-admin` (ikisi private, budaq `main`, remote adları `web` və `admin`; Vercel bunlardan deploy edir). Kök repo işləmə yeri qalır, bu ikisi onun `subtree` güzgüsüdür: **ayrı repolarda birbaşa dəyişiklik etmə**. **Commit qaydası (2026-10-27)**: iş boyu hər bitmiş və yoxlanmış addım **dərhal ayrıca lokal commit** olunur (soruşmadan; GitHub təqvimində hər iş günü görünsün). **Push qaydası (istifadəçi qərarı, 2026-10-20)**: push **yalnız istifadəçi deyəndə** ("push et", "pushla"); deyəndə dəyişən hər şey **həm kökə, həm də aid ayrı repoya** push olunur: `git push origin main`, sonra dəyişən qovluğa görə `git subtree push --prefix=web web main` və/və ya `git subtree push --prefix=admin admin main` (yalnız `supabase/` dəyişibsə ayrı repo lazım deyil). Yarımçıq və ya uğursuz iş push olunmur; istifadəçi "hələ push etmə" desə gözlə. Commit mesajı Azərbaycanca. Commitdən əvvəl: admin `npx tsc -b`, web `npx tsc --noEmit` + `npx eslint src`. `.env*` və `excel/` repoya düşmür, `.gitattributes`: LF. İstifadəçi "hələ push etmə, xoşuma gəlməsə geri dönək" deyəndə yeni funksiya `feature/...` budağında commit olunur; təsdiqdən sonra `main`-ə `--ff-only` + push (bazadakı miqrasiyalar budaqla geri qayıtmır: miqrasiya faylının başına `drop` əmrlərini yaz).
- **Dev serverləri Claude özü idarə edir** (2026-10-17-dən, istifadəçi istəyi): `admin/` → `npm run dev` (5173), `web/` → `npm run dev` (3000), fon prosesləri. Chrome-da hər biri üçün ayrı tab açıq qalır (admin, landing, usta paneli), tabları bağlama. Yaddaş azalıb server ölərsə yenidən başlat və tabı yenilə.
- **Bazaya yazma (Claude Code icazələri)**: Supabase MCP `apply_migration` üçün icazə qaydası var (istifadəçi `/permissions` ilə əlavə edib; yoxdursa auto-rejim "Production Deploy" ilə bloklayır). Claude öz icazə fayllarını (`.claude/settings*.json`) dəyişə bilmir ("Self-Modification" bloku): qayda lazımdırsa istifadəçi `/permissions` ilə əlavə edir. Bloklanan miqrasiyanı dolayı yolla keçməyə çalışma: SQL-i istifadəçiyə ver, o, Supabase paneli → SQL Editor-də (`https://supabase.com/dashboard/project/roodclienblwrrlswmty/sql/new`) işlədir. Toplu silmə və `drop`-dan əvvəl hədəfə (sətir sayı, nələr silinir) bax və istifadəçinin sözünü yoxla.

## Komandalar
Test yoxdur. Yoxlama = tip yoxlaması + brauzerdə canlı test.
- `npm run dev` (port 5173), `npx tsc -b` (tip yoxlaması), `npm run build`. ESLint qoşulmayıb.
- Vercel: `vercel.json` bütün ünvanları `/index.html`-ə yönləndirir (SPA; yoxsa `/depo` kimi səhifə yenilənəndə 404 olur).
- Dev serveri Claude özü fonda işlədir və Chrome-da ayrı tabı açıq saxlayır (yuxarıda "Layihə strukturu, git və iş qaydaları"). Server ölərsə, yenidən başladıb tabı yenilə.
- Brauzer testi: Claude in Chrome; admin hesabı (Anar) brauzerdə artıq daxil olub. Parol yazma.
- Responsivlik: 4 cihaz sinfi (mobil < 640, planşet 640–1023, large 1024–1535, xlarge ≥ 1536; istifadəçi qərarı 2026-10-20), ətraflı web `CLAUDE.md` "Responsivlik".
- Brauzer viewport 1536×735 (DPR 1.25): hündürlüyə həssas dizayn (`@media (max-height:820px)`, CSS dəyişənləri `--gutter`, `--panel-w`, `--header-h`).

## Stack
- Vite 8.3.2, React 19.3, React Router 8.4 (`BrowserRouter`, `Routes`), Tailwind v4 (`@tailwindcss/vite`), TypeScript 5.9, `@supabase/supabase-js` 2.117.2, lucide-react, `read-excel-file` (Excel import), `write-excel-file` (Excel ixrac). Versiyalar dəqiq (`--save-exact`), ən azı 2 həftəlik.
- Font: Plus Jakarta Sans (Google Fonts, `index.html`). Alias `@/` → `src/`.
- `.env.local` (git-ignored, **oxuma**): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Gizli açar burada yoxdur və olmamalıdır.

## UI qaydaları
- **Bildirişlər yalnız tostla** (`lib/toast.ts` + `components/Toaster.tsx`; `toast.success/error`). Formalarda `useOnSuccess(state, fn, "uğur mesajı")` xəta və uğur tostunu özü göstərir; `ConfirmButton` uğurda "Silindi" göstərir (`success` prop, `false` = tost yox). Formun içində `alert-error` və "Saxlanıldı" sətirləri yazma.
- **Toaster modaldan yuxarıdadır** (`z-[200]`, modal fonu `z-index: 100`): modal içindəki əməliyyatların (alət vermək, geri almaq, əlavə etmək) tostu əvvəl fonun arxasında qalıb görünmürdü. Yeni qat əlavə etsən, 200-dən aşağı saxla.
- Redaktə formaları `SaveConfirmForm` ilə: "Yadda saxla" → təsdiq modalı.
- Şəkillər kəsilməsin: sayt məzmunu üçün `object-contain` və ya öz nisbətində (`h-auto`) göstər.
- **Yan panel kənarlara yapışmır**: sürüşəndə yuxarıda (22px) və aşağıda (34px) yumşaq solğunlaşma (sticky `::before/::after`, maska yox: maska panelin çərçivəsini də solğunlaşdırar) + `padding-bottom: 20px`.
- **Yan panelin (`.side-panel`) scrollbar-ı gizlidir** (sürüşmə işləyir; "Depo məsulu → Yeni" forması açılanda zolaq görünməsin deyə; istifadəçi qərarı; admin `index.css` ↔ web `globals.css`).
- Siyahı öz içində sürüşəndə `nice-scroll` sinfi (`index.css`: 10px tutma sahəsi, 4px görünən yuvarlaq zolaq, hover-də 6px və tünd göy; yalnız `::-webkit-scrollbar` — Chrome 121+ `scrollbar-color` verilsə webkit-i yox sayır, standart xassələr `@supports not selector(::-webkit-scrollbar)` ilə Firefox üçündür; web `globals.css` ilə eyni). Paneldəki rəqəmlər `components/CountUp.tsx` ilə sayılaraq açılır (ease-out, azaldılmış hərəkətdə yox).
- `pages/Home/components/AllLogsModal/`: bütün iş qeydləri (günlərə görə qruplu, gün başlığı yapışqan, axtarışlı, son 300). `components/work/WorkLogModal/`: işin ətraflı pəncərəsi (usta, yer + xəritə, iş günü + "Əlavə edilib: tarix, saat", görülən iş, akt və şəkillər; `timeOf()`). İş yeri adı həmişə `text-primary` rəngdə; ustanın kartındakı `WorkTab`-da da saat göstərilir.
- **Səs yalnız səhifədə klikdən sonra çıxır** (brauzer qaydası; səhifə yenilənəndə sıfırlanır, dev-də HMR də yeniləyir): klik olmayıbsa tost "səs üçün səhifədə bir dəfə klik et" deyir, tab arxa plandadırsa başlıqda "(N) Yeni müraciət" görünür (`ContactRequestsListener`, `isSoundReady()`). Kod real sınaqdan keçib (klikdən sonra 2 not çalır).
- **Yeni müraciət**: Realtime (`contact_requests` INSERT) → tost + qısa səs + menyudakı sayğac (`NavLinks`) və siyahı yenilənir.
- **Çərçivə (2026-10-19, istifadəçi: "idarə etmə asan, stil göz oxşayan")**: yuxarıdakı 11 bəndli menyu əvəzinə **solda qruplu menyu** (`components/Sidebar/`: Gündəlik iş / Müştərilər / Komanda / Anbar və bilik / Sayt; nişanlar **hamısı qırmızıdır** (istifadəçi, 2026-10-23): baxılmamış müraciət, bugünkü gözləyən tapşırıq, depoda azalan, gözləyən icazə; "Menyunu yığ" yalnız ikonlar, seçim `lib/usePref.ts` ilə brauzerdə yadda qalır). `components/AppLayout.tsx` (`RequireAuth`-da) menyunu və **Ctrl+K axtarışını** (`components/CommandPalette/`: bölmə, şirkət, market, filial/mağaza, usta, rəhbərlik, alət/material; nəticə siyahının `?q=` axtarışını doldurur, `lib/urlQuery.ts`) saxlayır. **Başlıq bir sətirdir** (`AppHeader`: başlıq, səhifənin `actions`-ı, profil; axtarış düyməsi və Paneldəki "Saytı aç" istifadəçi istəyi ilə silinib, axtarış yalnız Ctrl+K ilə; `--header-h` 76px, alçaq ekranda 64px). Əsas əməliyyat düyməsi başlıqda `.hero-action` ("+ Yeni şirkət" → pəncərə; Şirkətlər/Mağazalar səhifəsində sağ panel yoxdur, siyahı tam endədir, axtarış + **Kart / Cədvəl** keçidi `.seg`, `.data-table`). Web usta panelinin header-i hələ köhnə üslubdadır (sinxron deyil).
- Klik olunan hər şeydə əl kursoru (`index.css` base qaydası; deaktivdə `not-allowed`).
- Yumşaq sürüşmə (Lenis) sınanıb və istifadəçinin istəyi ilə **silinib**: "ağırlıq yaradır". Yenidən təklif etmə.

## Web reposu ilə sinxron saxlanmalı olanlar
Repolar ayrıdır, kod paylaşılmır; bunlar əl ilə eyni saxlanmalıdır:
- Baza tipləri: `src/types/database/` — hər ikisinə `scripts/split-db-types.mjs` yazır (kökdə).
- `pages/Site/constants/textGroups/` (admin sahələri) ↔ web `src/lib/site-texts.ts` (`TEXT_DEFAULTS`). Yeni mətn: hər ikisinə açar + bazaya sətir (miqrasiya).
- `pages/Site/constants/siteConstants.ts` `ILLUSTRATED_KEYS` ↔ web `src/lib/site-content.ts` (illüstrasiyası olan avadanlıqlar: split, cassette, floor, ducted, outdoor).
- Dizayn: `src/index.css` ↔ web `src/app/globals.css` (tokenlər eynidir). Kopya komponentlər: Modal, ConfirmModal, ConfirmButton, forms, Toaster + `lib/toast.ts`, DatePicker, StoreCard, MapButton, SidePanel, Page, LogoutButton, `work/WorkLogForm`, `work/PlacePicker`, `lib/{experience,kinds,navigation,form-state}.ts`. Fərq: admin-də `"use client"` və Next importları yoxdur, `refresh()` əvəzinə `revalidate()`.
- İş qeydi pəncərəsi: `components/work/WorkLogModal/` ↔ web `components/work/WorkLogModal/`.
- Depo, Yanacaq, `shared/**` və `lib/{queryClient,zoom,revalidate,useData,urlQuery,usePref}.ts` web-də **ayrı kopyadır, sinxron skript YOXDUR** (silindi 2026-10-30, istifadəçi: "layihələri başqa-başqa adam işləyə bilər"): hər repo öz kodunu dəyişir, digərinə köçürmək lazımdırsa əl ilə. Web-ə məxsus: `views/Depot/index.tsx`, `views/MyTools/`.
- Avatar çevirmə (`toSquareWebp`): `shared/components/AvatarUpload/` ↔ web `components/ProfileButton.tsx`.

## Qaydalar
- `.env.local` fayllarını oxuma; parol və gizli açar yazma və oxuma. Hesab parollarını istifadəçi özü daxil edir.
- Test məlumatı uydurmadır (uydurma ünvan, telefon `+994 12 000 …`); real şəxs məlumatı uydurma. Test üçün özün yaratdığın sətirləri ("TEST" ilə başlayan) yoxladıqdan sonra dəqiq şərtlə (`id` + ad) sil. İstifadəçinin öz yazdığı qeydləri toplu silmək icazə sistemi tərəfindən bloklanır: istifadəçiyə UI-dan necə siləcəyini de.
- Supabase dashboard-da hesab və ya tənzimləmə dəyişikliyindən əvvəl icazə al.
- Shell-də `node -e` daxilində `\n` və `\D` kimi escape-lər pozulur; uzun skripti scratchpad-də `.cjs`/`.mjs` faylına yaz. Git Bash-in `/tmp`-i Node üçün başqa yerdir (`D:\tmp` axtarır): Node-a scratchpad-in Windows yolunu ver (`cygpath -m`). Azərbaycan hərfli böyük mətni heredoc ilə yox, Write aləti ilə fayla yaz.
- Edge Function (`supabase/functions/admin-accounts/index.ts`) **Deno**-dur: VS Code-da "Cannot find name 'Deno'" / "npm:" səhvləri Node TS-nin yanlış yoxlamasıdır. Həll quruldu: Deno uzantısı + `.vscode/settings.json` (`deno.enablePaths: ["supabase/functions"]`) + `supabase/functions/deno.json`; pəncərəni yenilə (Reload Window). Repolar ayrılanda `.vscode` yolunu `supabase/functions`-a görə düzəlt.
- Storage-dəki faylları SQL ilə silmək olmur (`storage.protect_delete`): yalnız Storage API (admin panelin `removeSiteImage`) və ya Supabase paneli. Test sətirlərini yazanda yalnız özün yazdığın `id`-lərlə sil (istifadəçi eyni cədvələ paralel real məlumat yaza bilər: bir dəfə onun müştəriləri sınaq sətirlərimlə qarışmışdı).
- Dev serverdə `globals.css` və ya yeni CSS dəyişikliyi görünmürsə: port 3000-i öldür, `web/.next` sil, `npm run dev` (bu sessiyada marquee CSS belə görünmədi). Yeni cədvəldən oxuyan `use cache` məlumatı ~1 dəqiqə gec görünür (SQL ilə yazanda `revalidateSite` çağırılmır).
- PDF oxumaq: `WebFetch` PDF-i parse edə bilmir, `Read` isə `pdftoppm` tələb edir (yoxdur). İşləyən yol: scratchpad-də `npm i pdfjs-dist@4.10.38`, `legacy/build/pdf.mjs` ilə mətn elementlərini koordinatla çıxar; cədvəl üçün `getOperatorList()`-dən xətləri (`constructPath`) götürüb xanalara böl.
- Dəyişikliklərdən sonra Chrome-da yoxla, amma **riskli klikləri təkrarlama**: modal/HMR sıfırlanandan sonra koordinatla klik real əməliyyata (məs. "Hamısını geri al") düşə bilər. Real məlumata yazan düymələri sınaqda basma, yalnız oxuma/açma yoxla.

## Növbəti işlər
- **Açıq qalanlar (2026-10-23 gecə)**: (1) depo nəzarəti (0084), kəsr miqdar / balon (0085) və depo bölməsinin yeni dizaynı push olunub; istifadəçi hələ sınayır ("pushla hələlik"), dizayn dəyişə bilər; (2) ~~admin-də bazadan birbaşa silinən `fuel_payments` canlı yenilənmir~~ **2026-10-28 yoxlandı, işləyir** (SQL ilə TEST ödəniş yaradılıb silindi: INSERT və DELETE admin Yanacaq səhifəsində canlı əks olundu; DELETE hadisəsində RLS səbəbindən `old` yalnız `id` daşıyır, kod yalnız yeniləyir, bəs edir; ehtimal ki, TanStack keşi + hədəfli `revalidate(...LIVE.fuel)` ilə düzəlib); (3) **sınaq məlumatı**: yürüşlər və ödənişlər 2026-10-24-də silinib; qalır maşın: Əlizadə 02-AA-002 Hyundai Elantra, Fərhad 77-CL-410 Mercedes Benz, ikisi benzin 10 l/100 km; qiymət benzin 1,15, dizel 1,10 — canlıya çıxmazdan əvvəl təmizlə (istifadəçidən soruş); (4) rəhbərlik formasında maşın yoxdur (istifadəçi istəsə); (5) **responsivlik**: usta paneli (web, 2026-10-24) və **admin (2026-10-27) bitdi** (yuxarıda "Admin responsivliyi"); yalnız Sayt/Rəhbərlik/Ustalar səhifələrini 320-də son dəfə gözlə yoxlamaq qalıb; ortaq fayllar artıq dəyişib: `index.css` (`.modal` 16px kənar, `max-height` + gizli sürüşmə, media sorğuları `width < 640px`), `AttendanceBoard`/`AttendanceCalendar` (< 1280 kartlar, seans nömrələri), `lib/attendance.ts` (`sessionNo`, `presenceText(p, sep)`), `export-attendance.ts` (Excel-də "1) 09:02"), `DepotUi`/`DepotForms` (mobil başlıq boşluğu); (6) web-də sınaq üçün yazılmış yanacaq məlumatı qalıb: Əlizadənin 2026-10-24 yürüşü (`mileage_logs` id 2) və iki ödəniş (`fuel_payments` id 1, 2, qeydi "TEST") — istifadəçi deyəndə sil.
- **Supabase ehtiyat nüsxəsi (backup)**: canlı məlumata keçməzdən əvvəl avtomatik ehtiyat nüsxənin açıq olduğunu yoxlamaq (tənzimləmədir; iş qeydləri kimi silinənlər geri qayıtmır, Səbət ləğv olunub).
- Müraciət formunun sürət limiti bazada tətbiq olunub (`0046`): eyni telefondan saatda 3, ümumi 10 dəq-də 20; web `elaqe/actions.ts` `too_many_requests` xətasını başa düşür. Telegram bildirişi istəmir (istifadəçi, 2026-10-18): müraciətlər yalnız admin → "Müraciətlər" səhifəsində görünür.
- Müraciətlər üçün brauzer bildirişi (istifadəçi: "qalsın").
- Daikin xəta kodlarında **"Edilecək iş" boşdur**: PDF-in 3–6-cı səhifələrindəki "Supposed causes" siyahısından kod başına doldurmaq (istifadəçi hələ istəməyib; "Xəta barədə məlumat yoxdur" sətirlərinə yazma). Model adları uzundur (`Daikin RA-SkyAir-VRV-PA-HRV`), istəsə "Modellər" tabında dəyişir.
- Analitika (Vercel Analytics və ya Plausible) hələ seçilməyib, quraşdırılmayıb. Canlıya çıxanda web `NEXT_PUBLIC_SITE_URL`, `ADMIN_ORIGIN`, admin `VITE_SITE_URL` real domenlərlə yazılmalıdır.
- **Responsivlik 2026-10-20-də başladı** (sayt: header, footer və ana səhifə dörd sinifdə hazırdır; qalan sayt səhifələri, sonra usta paneli, ən sonda admin). Ətraflı web `CLAUDE.md` "Responsivlik". Admin üçün bilinən: mobil başlıqda (390px) üfüqi daşma. **2026-10-24: usta paneli bitdi; admin responsivliyi növbətidir.** Admin-də web ilə eyni olan fayllar (`DatePicker`, `AttendanceBoard`, `AttendanceCalendar`, `Toaster`) web-də mobil üçün dəyişib, admin-ə KÖÇÜRÜLMƏYİB (web `CLAUDE.md` → "Usta paneli, mobil dəqiqləşdirmələr" → "Açıq qalanlar"); `DepotUi.tsx` və `textFields.ts` (`contact.waze`) admin-də yenilənib.
- **Landing planı (web `CLAUDE.md` → "Landing: qərarlar və qalan işlər")**: edilib: hero sürətli forma, rəqəmlər zolağı, necə işləyirik, FAQ, footer sosial, header telefon, xəritə dili, animasiyalar. **Qalan: "Haqqımızda" şəkilləri** (Fujitsu məhsul şəkillərinin əvəzinə öz real foto; istifadəçidən foto lazımdır, sona saxlanıb). Ləğv/qərar: xidmət təkrarının (4 kart / göy kateqoriyalar / "Xidmət növləri") təmizlənməsi **istənmədi** (5-ci təklif ləğv); "Bizə etibar edənlər" ləğv; hover ilə açılan menyu bəyənilmədi.
- Repoların ayrılması (sonda): `supabase/`-ı `admin/`-ə köçürmək, `admin/` və `web/`-i ayrı repolara çıxarmaq (məs. `git subtree split --prefix=admin` ilə tarixçə saxlanır).
- Xəritə üçün koordinat sahəsi (`site_settings`). (Silmək əvəzinə "Səbət" sınanıb və istifadəçinin istəyi ilə ləğv olunub: yenidən təklif etmə.)
- Ustalar üçün mobil tətbiq (React Native, Google Maps/Waze naviqasiyası). Mobildə mağaza/filial axtarışı kodla (məs. `ARZ-045`) + "Yol tap" (Google Maps marşrutu) və Waze lazımdır; web-də bu çıxarılıb, qaralama commit `019f8e4`-dədir.
- Hazır olanlar (təkrar təklif etmə): "Görülən işlər" səhifəsi (`/isler`), Depo tarixçəsi və minimum qalıq, tapşırıqlar, xəta kodları.
