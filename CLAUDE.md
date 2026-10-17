# CLAUDE.md — Freeze Air Service: Admin paneli (Vite)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ünsiyyət
- Hər şey Azərbaycan dilində: cavablar, izahlar, kod şərhləri. Kod, identifikatorlar, texniki terminlər olduğu kimi.
- Qısa, birbaşa. İstifadəçi ilə məcburi razılaşma yoxdur: səhvi açıq de, səbəbini qısa izah et, daha yaxşı variant təklif et.
- İstifadəçi "etmə, hələlik cavab ver" deyəndə yalnız cavab ver, kod yazma.

## Sistem haqqında (iki repo, bir baza)
Kondisioner servis şirkəti **Freeze Air Service** üçün sistem: ustalar, müqavilə bağlanan şirkətlər (filialları) və marketlər (mağazaları), alətlər (depo), ustaların gündəlik iş qeydləri, rəhbərlik, açıq sayt.

| Repo | Nədir | Kim üçün | Port |
|---|---|---|---|
| **admin** (bu repo) | Vite 8 + React 19 + React Router 8 SPA | adminlər və rəhbərlik: hər şeyi idarə edir, saytın məzmununu da | 5173 |
| **web** (ayrı repo) | Next.js 16 | açıq sayt (qonaq) + usta paneli (baxış, yalnız öz işləri) | 3000 |

İkisi də **eyni Supabase layihəsini** işlədir. `supabase/` qovluğu (miqrasiyalar + Edge Function) **bu (admin) reposuna aiddir**; web-də baza dəyişikliyi lazım olanda miqrasiya burada yazılır.

**Hazırkı vəziyyət (2026-10-17):** repolar hələ ayrılmayıb. Hər şey `D:\Praqramlasirma\Projects\kondisioner-servis\` altındadır: `admin/`, `web/`, `supabase/` (hələ kökdə, ayrılanda `admin/supabase/`-a köçürüləcək), `excel/` (test Excel faylları, heç bir repoya aid deyil). 

**Git (2026-10-17-dən):** hələlik hamısı **bir repodadır**, kökdə (`kondisioner-servis/.git`, budaq `main`): `admin/`, `web/`, `supabase/` birlikdə commit və push olunur. `web/`-in köhnə ayrıca `.git`-i (yalnız Next-in ilk commit-i) götürülüb. Kök `.gitignore`: `node_modules`, `.next`, `dist`, `.env*`, `excel/`; `.gitattributes`: LF.

## Komandalar
Test yoxdur. Yoxlama = tip yoxlaması + brauzerdə canlı test.
- `npm run dev` (port 5173), `npx tsc -b` (tip yoxlaması), `npm run build`. ESLint qoşulmayıb.
- Dev server fonda işləyir; kompüterdə yaddaş azalanda Claude Code onu dayandıra bilər. Belə olanda istifadəçiyə de, özün yenidən başlatma (istəsə başlat).
- Brauzer testi: Claude in Chrome; admin hesabı (Anar) brauzerdə artıq daxil olub. Parol yazma.
- Brauzer viewport 1536×735 (DPR 1.25): hündürlüyə həssas dizayn (`@media (max-height:820px)`, CSS dəyişənləri `--gutter`, `--panel-w`, `--header-h`).

## Stack
- Vite 8.3.2, React 19.3, React Router 8.4 (`BrowserRouter`, `Routes`), Tailwind v4 (`@tailwindcss/vite`), TypeScript 5.9, `@supabase/supabase-js` 2.117.2, lucide-react, `read-excel-file` (Excel import). Versiyalar dəqiq (`--save-exact`), ən azı 2 həftəlik.
- Font: Plus Jakarta Sans (Google Fonts, `index.html`). Alias `@/` → `src/`.
- `.env.local` (git-ignored, **oxuma**): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Gizli açar burada yoxdur və olmamalıdır.

## Kod quruluşu (`src/`)
- `App.tsx`: marşrutlar `/login`, `/`, `/sirketler(/:id)`, `/magazalar(/:id)`, `/ustalar`, `/rehberlik`, `/depo`, `/muracietler`, `/sayt`; `RequireAuth` (admin üçün `ContactRequestsListener` də burada); `<Toaster />`.
- `auth/AuthProvider.tsx`: sessiya + `admin`, `owner`, `storekeeper`, `canManageTools` (sahib və ya depo məsulu), `name`, `position`, `linked`, `employeeId`, `photoUrl`, `reload()`.
- `lib/`:
  - `supabase/client.ts`: tək brauzer klienti, yalnız publishable açar;
  - `revalidate.ts` + `useData.ts`: Next-dəki `refresh()` əvəzi; mutasiyadan sonra `revalidate()` çağır, `useData` siyahıları yenidən yükləyir;
  - `toast.ts`: bildirişlər;
  - `sound.ts`: qısa bildiriş səsi (Web Audio, faylsız, iki not ~0.3 san.). Səs mexanizmi ilk klik/düymə/toxunuşda "açılır" (unlock), çünki brauzer istifadəçi hərəkəti olmadan səsə icazə vermir;
  - `database.types.ts`: baza tipləri;
  - `kinds.ts`: şirkət/market mətnləri (`KIND`);
  - `navigation.ts`: koordinat parse, xəritə linkləri;
  - `form-state.ts`, `experience.ts`.
- `actions/`: Supabase çağırışları (companies, stores, employees, tools, accounts → Edge Function, requests, site, siteContent).
- `pages/`: Home (iş paneli, aşağıda ətraflı), Clients, Employees, Management, Depot (aşağıda), Requests (müraciətlər: solda axtarışlı siyahı, sağda seçilmiş müraciət; zəng/WhatsApp/e-poçt, baxıldı, sil), Site, Login.
- `components/`:
  - ümumi: Page, AppHeader (profil + ProfileModal + LogoutButton), SidePanel (`WithSidePanel`), Modal (`useEscapeLayer`: Esc yalnız ən üst qatı bağlayır), ConfirmModal/ConfirmButton, forms (`ActionForm`, `SaveConfirmForm`, `Buttons`, `Field`, `useOnSuccess`), DatePicker (az dilli təqvim), ToolPicker (axtarışlı seçim: alət və ya əməkdaş; `name`, `icon`, `hint` prop-ları), MapButton, StoreCard, Toaster, ContactRequestsListener;
  - qovluqlar: `clients/`, `stores/` (StoreForms, StoreImport: Excel), `employees/` (EmployeeForms, AvatarUpload), `management/`, `depot/` (DepotForms), `work/` (WorkTab, WorkLogForm, PlacePicker), `site/` (saytın məzmunu).

### Panel (`/`, `pages/Home.tsx`)
- Başlıq "Salam, <ad>" + bugünkü tarix (az dilində), sağda "Saytı aç".
- 4 göstərici kartı (klik olunur): şirkət + filial, market + mağaza, usta + rəhbər, alət (ədədlərin cəmi; depoda / ustalarda → `/depo`). Rəqəmlər `CountUp` ilə sayılaraq açılır (2.5 san., ease-out).
- **İş qeydləri** və **Müraciətlər** kartları sabit və eyni hündürlükdədir (`h-[374px]`, düz 4 element sığır), sürüşmə yoxdur: hər birində son 4 element. "Hamısına bax" yalnız element olanda çıxır: iş qeydlərində `AllLogsModal`, müraciətlərdə `/muracietler`. İş qeydinə klik → `WorkLogModal`. Siyahıda iş yeri göy, sağda saat.
- **Ustalar bu gün**: aktiv ustalar bugünkü iş sayına görə sıralanır; sağda nişan (yaşıl "N iş" / boz "0"); yaşıl nişana klik → `AllLogsModal` ustanın adı ilə süzülmüş (`initialQuery`).
- Sürətli keçidlər və yığcam "Bölmələr" (Xəta kodları "Hazırlanır").
- Məlumat `useData(fetchDashboard)` ilə; `revalidate()` (məs. Realtime müraciət) hamısını yeniləyir.

### Depo (`/depo`, `pages/Depot.tsx` + `components/depot/DepotForms.tsx`)
- Hamı baxır; yazmaq `canManageTools` (bazada `can_manage_tools()`). Aksiyalar `actions/tools.ts`: `addTool`, `updateTool`, `deleteTool`, `giveTool`, `returnTool(assignmentId, say)`, `setStorekeeper`.
- **Sadə saxla** (istifadəçi əvvəlki variantı "çox qəliz" adlandırıb): axtarış + cədvəl (Alət | Cəmi | Ustalarda | Depoda). Göstərici kartları, filtrlər, zolaqlar, tarixçə tabı **qəsdən yoxdur**.
- Sətrə klik → pəncərə: başlıqda "Cəmi · ustalarda · depoda", "Kimdədir" siyahısı ("Geri al": 1 ədəddirsə dərhal, çoxdursa say soruşulur), altda "Kimə verilir?" (yalnız ustalar, rəhbərlik siyahıda yoxdur) + say + "Ver".
- Forma: yalnız Ad, Say, İnventar kodu (`category`/`notes` bazada qalır, UI-da yoxdur; `updateTool` formada olmayan sahəyə toxunmur).
- **Say yoxlaması dərhal**: `components/QuantityInput.tsx` — limitdən çox yazılan kimi tost + sahənin altında qırmızı yazı ("Depoda cəmi 1 ədəd qalıb — 2 ədəd vermək olmur."); göndərəndə də yoxlanır, sorğu getmir. Brauzerin `max` atributu işlənmir (səssiz bloklayır). Redaktədə say ustalardakından az olanda, ustada olan aləti silməyə çalışanda da tost.
- Sağ panel: "Yeni alət" (yalnız depo məsulu/müdir) + "Depo məsulu" (hamı görür, müdir təyin edir/götürür; hesabı yoxdursa "Giriş hesabı yoxdur").
- Depo məsulu usta olarsa, depo işini **web usta panelində** (`/depo`, yalnız ona görünür) də görür; o səhifə buradakı Depo-nun kopyasıdır (sinxron saxla).
- Ustalar səhifəsində ustanın "Alətlər" tabı da eyni qaydadadır (say ×N, × hamısını qaytarır, "Alət ver" `QuantityInput` ilə).

### Sayt səhifəsi (`/sayt`): açıq saytın bütün məzmunu buradan idarə olunur
| Tab | Cədvəl | Fayl |
|---|---|---|
| Əlaqə | `site_settings` (phone, email, address, hours); sağda saytdakı Əlaqə blokunun canlı önizləməsi | `components/site/ContactTab.tsx` |
| Ana səhifə | `site_settings`: `logo_url` (saytın loqosu, header + footer), `hero_image_url`, `about_*` (Haqqımızda mətni, siyahı, kart, 2 şəkil), `about_card_color` (`night`/`cold`/`ice`/`white`); header, hero künc nişanları və kartın canlı önizləməsi | `components/site/HomeTab.tsx` |
| Mətnlər | `site_texts` (saytın bütün sabit mətnləri, səhifələrə görə qruplar) | `components/site/TextsTab.tsx`, `textFields.ts` |
| Obyektlər | `site_segments` (+ `image_position`, bağlı avadanlıq) | `components/site/ContentTabs.tsx`, `SegmentEditor.tsx` |
| Avadanlıq | `site_equipment` | `ContentTabs.tsx`, `EquipmentEditor.tsx` |
| Xidmətlər | `site_services` (siyahı + hər xidmətin səhifəsi: başlıq izahı, ətraflı mətn, "Nə daxildir", addımlar, məsləhət, şəkil) | `ServicesTab.tsx` (kart şəbəkəsi + səhifə dolğunluğu 6 hissə), `ServiceEditor.tsx` |

- Şəkillər `site` bucket-inə gedir (`actions/siteContent.ts`: `uploadSiteImage` brauzerdə WebP-yə, ən çox 1600px; `removeSiteImage`). Ana səhifə şəkilləri yüklənən kimi saxlanır.
- Tövsiyə olunan ölçülər: obyekt 16:9 (1600×900), avadanlıq 16:9 (1600×900), hero 4:3 (1600×1200), Haqqımızda böyük şəkil 16:9, kiçik şəkil kvadrat (800×800), əməkdaş kvadrat (ən azı 512).
- Saytda dəyişikliklər ~5 saniyəyə görünür (web-də `lib/site-cache.ts` → `cacheLife(SITE_CACHE)`, səhifəni yeniləmək lazımdır). Dərhal təmizləmə (`revalidateTag` API) hələ edilməyib.
- `SITE_URL = "http://localhost:3000"` `pages/Site.tsx` və `components/site/ContentTabs.tsx`-də sabitdir; deploy-da env-ə keçirilməlidir.

## UI qaydaları
- **Bildirişlər yalnız tostla** (`lib/toast.ts` + `components/Toaster.tsx`; `toast.success/error`). Formalarda `useOnSuccess(state, fn, "uğur mesajı")` xəta və uğur tostunu özü göstərir; `ConfirmButton` uğurda "Silindi" göstərir (`success` prop, `false` = tost yox). Formun içində `alert-error` və "Saxlanıldı" sətirləri yazma.
- **Toaster modaldan yuxarıdadır** (`z-[200]`, modal fonu `z-index: 100`): modal içindəki əməliyyatların (alət vermək, geri almaq, əlavə etmək) tostu əvvəl fonun arxasında qalıb görünmürdü. Yeni qat əlavə etsən, 200-dən aşağı saxla.
- Redaktə formaları `SaveConfirmForm` ilə: "Yadda saxla" → təsdiq modalı.
- Şəkillər kəsilməsin: sayt məzmunu üçün `object-contain` və ya öz nisbətində (`h-auto`) göstər.
- Siyahı öz içində sürüşəndə `nice-scroll` sinfi (`index.css`: 10px tutma sahəsi, 4px görünən yuvarlaq zolaq, hover-də 6px və tünd göy; yalnız `::-webkit-scrollbar` — Chrome 121+ `scrollbar-color` verilsə webkit-i yox sayır, standart xassələr `@supports not selector(::-webkit-scrollbar)` ilə Firefox üçündür; web `globals.css` ilə eyni). Paneldəki rəqəmlər `components/CountUp.tsx` ilə sayılaraq açılır (ease-out, azaldılmış hərəkətdə yox).
- `components/work/AllLogsModal.tsx`: bütün iş qeydləri (günlərə görə qruplu, gün başlığı yapışqan, axtarışlı, son 300). `components/work/WorkLogModal.tsx`: işin ətraflı pəncərəsi (usta, yer + xəritə, iş günü + "Əlavə edilib: tarix, saat", görülən iş, akt və şəkillər; `timeOf()`). İş yeri adı həmişə `text-primary` rəngdə; ustanın kartındakı `WorkTab`-da da saat göstərilir.
- **Yeni müraciət**: Realtime (`contact_requests` INSERT) → tost + qısa səs + menyudakı sayğac (`NavLinks`) və siyahı yenilənir.
- Klik olunan hər şeydə əl kursoru (`index.css` base qaydası; deaktivdə `not-allowed`).
- Yumşaq sürüşmə (Lenis) sınanıb və istifadəçinin istəyi ilə **silinib**: "ağırlıq yaradır". Yenidən təklif etmə.

## Baza (Supabase): web reposunda da eyni bölmə var
- Layihə id **`roodclienblwrrlswmty`** (Frankfurt). Qeydiyyat (signup) bağlıdır: hesabları admin açır.
- **Təhlükəsizlik bazadadır, UI-da yox.** Bütün yetkilər RLS + funksiyalarla təmin olunur; frontendlər yalnız publishable açarla birbaşa Supabase-ə müraciət edir. UI-da düymə gizlətmək yalnız əksetdirmədir. Yeni yetki qaydası = yeni miqrasiya.
- **Gizli (service role) açar yalnız Edge Function `admin-accounts`-dadır** (bu repoda `supabase/functions/admin-accounts/index.ts`). Əməliyyatlar: `list_emails`, `create`, `reset_password`, `delete`. Çağıranın admin olduğunu, rəhbərlik hesabı üçün sahib olduğunu və öz hesabına toxunmadığını yoxlayır. Deploy: Supabase MCP `deploy_edge_function` (`verify_jwt: true`). CORS `*`.

### Cədvəllər (`public`)
| Cədvəl | Əsas sütunlar | Qeyd |
|---|---|---|
| `profiles` | id (= auth.users.id), full_name, role (`admin`/`worker`), is_owner | `handle_new_user` trigger-i ilə yaranır |
| `employees` | full_name, position, specialty, is_management, is_storekeeper, start_date, phone, photo_url, user_id, is_active | usta və rəhbərlik birlikdə; `user_id` hesabı bağlayır; `is_storekeeper` = depo məsulu (yalnız müdir təyin edir) |
| `companies` | name, kind (`company`/`market`), phone, contact_person, notes, logo_url, address, lat, lng | şirkət (bank, stadion, residence) və ya market şəbəkəsi |
| `stores` | company_id, code, name, address, lat, lng, phone, notes | şirkətin filialı / marketin mağazası |
| `tools`, `tool_assignments` | alət: name, inventory_code, category, notes, **quantity** (ümumi say); təhvil: tool_id, employee_id, **quantity**, taken_at, returned_at | bir ustada eyni alətdən bir açıq təhvil (unikal indeks), yenisi verəndə say artır; view `tool_stock`: quantity, given_out (ustalarda), available (depoda) |
| `work_logs` | employee_id, work_date, store_id \| company_id \| place_text, description, created_by | iş yeri: üçündən biri mütləqdir (check) |
| `work_files` | work_log_id, kind, path | `work` bucket-dəki fayllar |
| `contact_requests` | name, phone, email, message, handled | saytdakı "Bizə yazın"; Realtime-da |
| `site_settings` | tək sətir (id = 1): phone, address, hours, email, logo_url, hero_image_url, about_title, about_text, about_points, about_card_title, about_card_text, about_card_color, about_image_main_url, about_image_side_url | saytın əlaqə və ana səhifə məlumatları |
| `site_texts` | key, value | saytın sabit mətnləri (111 açar) |
| `site_segments` | slug, title, summary, lead, issues[], work[], note, equipment[] (site_equipment.key), image_url, image_position, sort, is_active | obyekt növləri → `/xidmetler/[slug]` |
| `site_equipment` | key, title, text, place, image_url, sort, is_active | avadanlıq növləri |
| `site_services` | slug, title, text, icon, lead, details, includes[], steps[], note, image_url, sort, is_active | xidmətlər siyahısı + hər xidmətin səhifəsi `/xidmet/[slug]` |
| `ac_brands`, `ac_error_codes` | brend; kod, model_series, title, cause, solution | Xəta kodları bölməsi üçün (UI hələ yoxdur) |

### Funksiyalar və trigger-lər (hamısı `security definer`)
- `is_admin()`, `is_owner()` (sahib = müdir), `my_employee_id()`: RLS qaydalarının əsası.
- `public_employees()`: açıq sayt üçün ustaların yalnız adı, ixtisası, işə başlama tarixi və şəkli (telefon yox).
- `public_management()`: açıq sayt üçün rəhbərliyin yalnız adı, vəzifəsi (`job_title`) və şəkli; müdir birinci.
- `set_employee_photo(p_employee_id, p_url)`: profil şəklinin **yeganə** dəyişmə yolu; yalnız özü və ya müdir; link həmin əməkdaşın `avatars/<id>/` qovluğuna aid olmalıdır.
- Trigger `employees_guard_photo` (BEFORE UPDATE): başqasının `photo_url`-unu birbaşa dəyişməyi bloklayır.
- Trigger `employees_sync_role` (AFTER INSERT/UPDATE): hesab rəhbərliyə (`is_management`) bağlananda `admin`, ustaya bağlananda `worker` rolu verir. Rol yalnız belə dəyişir.
- Depo: `is_storekeeper()`, `can_manage_tools()` (= sahib və ya aktiv depo məsulu); RPC `give_tool(p_tool_id, p_employee_id, p_quantity)` və `return_tool(p_assignment_id, p_quantity)` (hissə-hissə qaytarma; qaytarılan hissə bağlı sətir kimi tarixçədə qalır; ikisi də `security invoker`, yetki RLS-dən). Trigger-lər: `tool_assignments_check_stock` (depodakından çox vermək olmur, alət sətri kilidlənir), `tools_guard_stock` (say ustalardakından az ola bilməz; ustada olan alət silinmir), `employees_guard_storekeeper` (`is_storekeeper`-i yalnız sahib dəyişir), `tool_assignments_only_masters` (alət yalnız aktiv ustaya, rəhbərliyə yox).
- `handle_new_user`: yeni auth istifadəçisi → `profiles` sətri. `rls_auto_enable`: yeni cədvəldə RLS-i avtomatik açır.

### Yetkilər (RLS)
- **Üç səviyyə:** sahib (müdir, `profiles.is_owner`) → admin → usta (worker). Qonaq (anon) yalnız saytın açıq məlumatlarını oxuyur.
- Giriş edən hər kəs iş cədvəllərini oxuyur (companies, stores, employees, tools, work_logs…).
- **Depo** (`tools`, `tool_assignments`): yazmaq yalnız **depo məsulu və sahib** (`can_manage_tools()`); digər adminlər və ustalar yalnız baxır. Depo məsulu usta da ola bilər: admin panelə daxil olub Depo bölməsini idarə edir.
- **Admin**: şirkət, mağaza, usta, sayt məzmunu yazır; müraciətləri oxuyur, dəyişir, silir. İş qeydi **açmır**.
- **Rəhbərlik (`is_management`) sətirlərini yalnız sahib yazır**; sahib öz kartını dəyişə və silə bilməz.
- **Usta**: yalnız öz iş qeydini (və fayllarını) əlavə edir; dəyişmək və silmək: sahibi və ya admin.
- **Profil şəkli**: hər kəs yalnız öz şəklini, müdir hamınınkını (storage də: öz qovluğu və ya müdir).
- `profiles`: istifadəçi yalnız öz `full_name`-ini dəyişir; özünü və ya admin hamını görür.
- Sayt cədvəlləri (`site_*`): anon və authenticated oxuyur, admin yazır. `contact_requests`: hamı **yalnız əlavə edir**, oxumaq admin. Anon üçün oxu qaydaları ayrıdır, çünki anon `is_admin()`-i çağıra bilmir.

### Storage
| Bucket | Açıq | Limit | Yol / yetki |
|---|---|---|---|
| `work` | yox (imzalı link) | 10 MB; jpeg/png/webp/heic/pdf | `<log_id>/<uuid>.<ext>`; yükləmək usta özü, silmək sahibi/admin |
| `avatars` | bəli | 2 MB; webp/jpeg/png | `<əməkdaş_id>/<uuid>.webp`, brauzer 512px kvadrat WebP edir; öz qovluğu və ya müdir |
| `site` | bəli | 3 MB; webp/jpeg/png | `segments/`, `equipment/`, `services/`, `logo/`, `hero/`, `about/`; yalnız admin |

Storage-də `remove` faylı həmişə dərhal silmir; köhnə şəkillər bucket-də qala bilər.

### Realtime
- Publikasiya `supabase_realtime`-da yalnız `contact_requests`. Hadisəni RLS-ə görə yalnız admin alır.

### Miqrasiyalar (`supabase/migrations/`, bu repoda)
- `0001`–`0031`. Ad formatı `NNNN_ad.sql`; Supabase MCP `apply_migration` ilə tətbiq et və faylı da yaz.
- Mühüm olanlar:
  - 0005: work_logs, `my_employee_id`;
  - 0010: rol trigger-i;
  - 0011: avatars;
  - 0012/0013: sahib;
  - 0014/0016: contact_requests;
  - 0015: site_settings;
  - 0017: public_employees;
  - 0018: site_segments, site_services, site bucket;
  - 0020: site_equipment;
  - 0021/0022/0025: ana səhifə sahələri;
  - 0023: site_texts;
  - 0024: Realtime;
  - 0026: öz profil şəkli;
  - 0027: saytın loqosu (`logo_url`);
  - 0028: `public_management()`, saytda "Rəhbərlik";
  - 0029: xidmət səhifələri (`site_services` yeni sahələr + ilkin məzmun);
  - 0030: depo: alət sayı (`quantity`), `tool_stock`, depo məsulu (`is_storekeeper`), `give_tool`/`return_tool`; `tools.status` və `tool_current_holders` silindi;
  - 0031: alət yalnız aktiv ustaya verilir (trigger `tool_assignments_only_masters`; rəhbərlik ala bilməz).
- RLS dəyişikliyini simulyasiya olunmuş JWT ilə DO-blokunda yoxla: `set_config('request.jwt.claims', json_build_object('sub', <uuid>, 'role', 'authenticated')::text, true)`, `set local role authenticated`. Nəticəni `raise exception 'NƏTİCƏ ...'` ilə çıxar, bu da hər şeyi geri qaytarır.
- `database.types.ts` əl ilə yenilənib; dəyişiklikdən sonra Supabase MCP `generate_typescript_types` ilə yenidən yarat və **web reposundakı eyni fayla da** köçür.

### Hesablar və məlumat
- Sahib (müdir) = **Məmmədov Anar** (`xeyyamelizade5@gmail.com`), admin, employee id 8.
- Usta hesabı: `xeyyamalizade5@gmail.com` → **Əlizadə Xəyyam**, employee id 1. Diqqət: "e"/"a" fərqi.
- Rəhbərlik: id 7 Abdulov Ceyhun, id 8 Məmmədov Anar, id 9 Mirmanafov Mirsadiq.
- Marketlər: "Araz Market" (id 4, 200 mağaza, kodlar `ARZ-001…`), "TEST Oba Market" (id 6, 200 mağaza, `OBA-001…`). Mağazalar `excel/*-market-200.xlsx`-dən import olunub, məlumat uydurmadır. İstifadəçi "TEST" sözünü adlardan hələlik götürməmək dedi.
- Şirkətlər: Rabitə Bank (id 7, 10 filial), Qarabağ Stadion, Knightsbridge Residence, Port Baku Residence, İzmir Villa (filialsız, sabit məkan).
- 2026-10-17 sonunda: iş qeydi və müraciət **yoxdur** (hamısı silinib).

## Web reposu ilə sinxron saxlanmalı olanlar
Repolar ayrıdır, kod paylaşılmır; bunlar əl ilə eyni saxlanmalıdır:
- `src/lib/database.types.ts` ↔ web `src/lib/database.types.ts`.
- `components/site/textFields.ts` (admin sahələri) ↔ web `src/lib/site-texts.ts` (`TEXT_DEFAULTS`). Yeni mətn: hər ikisinə açar + bazaya sətir (miqrasiya).
- `components/site/EquipmentEditor.tsx` `ILLUSTRATED_KEYS` ↔ web `src/lib/site-content.ts` (illüstrasiyası olan avadanlıqlar: split, cassette, floor, ducted, outdoor).
- Dizayn: `src/index.css` ↔ web `src/app/globals.css` (tokenlər eynidir). Kopya komponentlər: Modal, ConfirmModal, ConfirmButton, forms, Toaster + `lib/toast.ts`, DatePicker, StoreCard, MapButton, SidePanel, Page, LogoutButton, `work/WorkLogForm`, `work/PlacePicker`, `lib/{experience,kinds,navigation,form-state}.ts`. Fərq: admin-də `"use client"` və Next importları yoxdur, `refresh()` əvəzinə `revalidate()`.
- Depo: `components/depot/DepotForms.tsx` ↔ web `components/depot/DepotView.tsx`; `actions/tools.ts` ↔ web `lib/tools.ts`; `components/{ToolPicker,QuantityInput}.tsx` ↔ web.
- Avatar çevirmə (`toSquareWebp`): `employees/AvatarUpload.tsx` ↔ web `components/ProfileButton.tsx`.

## Qaydalar
- `.env.local` fayllarını oxuma; parol və gizli açar yazma və oxuma. Hesab parollarını istifadəçi özü daxil edir.
- Test məlumatı uydurmadır (uydurma ünvan, telefon `+994 12 000 …`); real şəxs məlumatı uydurma. Test üçün özün yaratdığın sətirləri ("TEST" ilə başlayan) yoxladıqdan sonra dəqiq şərtlə (`id` + ad) sil. İstifadəçinin öz yazdığı qeydləri toplu silmək icazə sistemi tərəfindən bloklanır: istifadəçiyə UI-dan necə siləcəyini de.
- Supabase dashboard-da hesab və ya tənzimləmə dəyişikliyindən əvvəl icazə al.
- Shell-də `node -e` daxilində `\n` və `\D` kimi escape-lər pozulur; uzun skripti scratchpad-də `.cjs` faylına yaz.

## Növbəti işlər
- **"Görülən işlər" bölməsi** (`/isler`, təklif olunub, istifadəçi təsdiqləməyib): tarix aralığı, usta, şirkət/market filtrləri, axtarış, xülasə, günlərə görə qruplu siyahı, Excel-ə ixrac.
- Repoların ayrılması (sonda): `supabase/`-ı `admin/`-ə köçürmək, `admin/` və `web/`-i ayrı repolara çıxarmaq (məs. `git subtree split --prefix=admin` ilə tarixçə saxlanır).
- Xəta kodları bölməsi (`ac_brands`, `ac_error_codes`).
- Saytın keşini admin dəyişikliyindən sonra dərhal təmizləmək (`revalidateTag` + web-də `/api/revalidate`).
- Müraciətlər üçün e-poçt bildirişi (Resend və s.), brauzer bildirişi.
- Xəritə üçün koordinat sahəsi (`site_settings`); silmək əvəzinə "Səbət" (soft-delete).
- Ustalar üçün mobil tətbiq (React Native, Google Maps/Waze naviqasiyası).
