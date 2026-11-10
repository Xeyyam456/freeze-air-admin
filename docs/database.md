# Baza (Supabase): cədvəllər, funksiyalar, RLS, miqrasiyalar

> Bu fayl `CLAUDE.md`-dən çıxarılıb (ətraflı sənəd). Fayl yolları köhnələ bilər: qovluq quruluşu üçün həqiqət mənbəyi `ARCHITECTURE.md`-dir. Lazım olanda oxu.

## Baza (Supabase): web reposunda da eyni bölmə var
- Layihə id **`roodclienblwrrlswmty`** (Frankfurt). Qeydiyyat (signup) bağlıdır: hesabları admin açır.
- **Təhlükəsizlik bazadadır, UI-da yox.** Bütün yetkilər RLS + funksiyalarla təmin olunur; frontendlər yalnız publishable açarla birbaşa Supabase-ə müraciət edir. UI-da düymə gizlətmək yalnız əksetdirmədir. Yeni yetki qaydası = yeni miqrasiya.
- **Gizli (service role) açar yalnız Edge Function `admin-accounts`-dadır** (bu repoda `supabase/functions/admin-accounts/index.ts`). Əməliyyatlar: `list_emails`, `create`, `reset_password`, `delete`. Çağıranın admin olduğunu, rəhbərlik hesabı üçün sahib olduğunu və öz hesabına toxunmadığını yoxlayır. Deploy: Supabase MCP `deploy_edge_function` (`verify_jwt: true`). CORS `*`.

### Cədvəllər (`public`)
| Cədvəl | Əsas sütunlar | Qeyd |
|---|---|---|
| `profiles` | id (= auth.users.id), full_name, role (`admin`/`worker`), is_owner | `handle_new_user` trigger-i ilə yaranır |
| `employees` | full_name, position, specialty, is_management, is_storekeeper, **worker_type** (`master`/`assistant`/`driver`: usta, köməkçi, sürücü; admin işə qəbulda "İş növü" keçidi ilə seçir, `position` da ona görə yazılır; migrasiya 0052), start_date, phone, photo_url, user_id, is_active | usta və rəhbərlik birlikdə; `user_id` hesabı bağlayır; `is_storekeeper` = depo məsulu (yalnız admin təyin edir) |
| `companies` | name, kind (`company`/`market`), phone, contact_person, notes, logo_url, address, lat, lng | şirkət (bank, stadion, residence) və ya market şəbəkəsi |
| `stores` | company_id, code, name, address, lat, lng, phone, notes | şirkətin filialı / marketin mağazası |
| `tools`, `tool_assignments`, `material_pieces` | alət **və material**: name, inventory_code, category, notes, **quantity** (TAM hissənin sayı), **kind** (`tool`/`material`), **unit** (ədəd, metr, kq...); təhvil: tool_id, employee_id, **quantity**, **used** (materialda işlədilən), taken_at, returned_at; **parçalar** (`material_pieces`): tool_id, length, from_employee_id, created_at | bir ustada eyni alətdən/materialdan bir açıq təhvil (unikal indeks), yenisi verəndə say artır; view `tool_stock`: quantity, given_out (ustalarda), available (tam, depoda), kind, unit, pieces_count, pieces_total. **Ümumilikdə nə qədər var = quantity + pieces_total** |
| `work_logs` | employee_id, work_date, store_id \| company_id \| place_text, description, created_by | iş yeri: üçündən biri mütləqdir (check) |
| `work_files` | work_log_id, kind, path | `work` bucket-dəki fayllar |
| `contact_requests` | name, phone, email, message, handled | saytdakı "Bizə yazın"; Realtime-da |
| `site_settings` | tək sətir (id = 1): phone, address, hours, email, logo_url, hero_image_url, about_title, about_text, about_points, about_card_title, about_card_text, about_card_color, about_image_main_url, about_image_side_url | saytın əlaqə və ana səhifə məlumatları |
| `site_texts` | key, value | saytın sabit mətnləri (126 açar) |
| `site_segments` | slug, title, summary, lead, issues[], work[], note, equipment[] (site_equipment.key), image_url, image_position, sort, is_active | obyekt növləri → `/xidmetler/[slug]` |
| `site_equipment` | key, title, text, place, image_url, sort, is_active | avadanlıq növləri |
| `site_services` | slug, title, text, icon, lead, details, includes[], steps[], note, image_url, sort, is_active | xidmətlər siyahısı + hər xidmətin səhifəsi `/xidmet/[slug]` |
| `ac_models`, `ac_error_codes` | model; model_id, code, title, solution | Xəta kodları (`/xeta-kodlari`); `ac_brands` və `model_series` istifadə olunmur |

### Funksiyalar və trigger-lər (hamısı `security definer`)
- `is_admin()`, `is_owner()` (sahib = müdir), `my_employee_id()`: RLS qaydalarının əsası.
- `public_employees()`: açıq sayt üçün ustaların yalnız adı, ixtisası, işə başlama tarixi və şəkli (telefon yox).
- `public_management()`: açıq sayt üçün rəhbərliyin yalnız adı, vəzifəsi (`job_title`) və şəkli; müdir birinci.
- `set_employee_photo(p_employee_id, p_url)`: profil şəklinin **yeganə** dəyişmə yolu; yalnız özü və ya müdir; link həmin əməkdaşın `avatars/<id>/` qovluğuna aid olmalıdır.
- Trigger `employees_guard_photo` (BEFORE UPDATE): başqasının `photo_url`-unu birbaşa dəyişməyi bloklayır.
- Trigger `employees_sync_role` (AFTER INSERT/UPDATE): hesab rəhbərliyə (`is_management`) bağlananda `admin`, ustaya bağlananda `worker` rolu verir. Rol yalnız belə dəyişir.
- Depo funksiyaları 0084-dən **security definer**-dir və yetkini `depot_check()` ilə yoxlayır (əvvəl invoker + RLS); `finish_material` silinib. Material təhvili: RPC `settle_material(p_assignment_id, p_used, p_returned)` (0048, 0049-da yenilənib) — işlənən sərf olunur, qaytarılan depoya (metrdə ≤ 3 → parça, > 3 → tam), qalan ustada qalır; `material_small_to_pieces(p_tool_id)` depodakı 1–3 metr tam hissəni parçaya çevirir (`give_tool` və `settle_material` çağırır). Aşağıdakı `finish_material` köhnə RPC-dir (UI artıq işlətmir): RPC `finish_material(p_assignment_id, p_used)` — usta götürdüyündən `p_used` qədər işlədib: **işlənən sərf olunur** (`tools.quantity` azalır, `tool_assignments.used` yazılır), **qalan hissə depoya AYRI PARÇA kimi yazılır** (`material_pieces`; 3 usta 2 metr qaytarsa, 6 metrlik tam boru yox, 3 ədəd 2 metrlik parça); `p_used = 0` olsa götürülən olduğu kimi tam depoya qayıdır (quantity dəyişmir). RPC `give_piece(p_piece_id, p_employee_id, p_amount default null)`: parçanın hamısı və ya **bir hissəsi** ustaya verilir (`p_amount` verilsə qalan hissə depoda parça kimi qalır: 4 metrlik parçadan 2 metr verilir, 2 metrlik parça qalır); verilən hissə tam hissəyə qatılıb ustaya verilir. İkisi də `security invoker`, yetki RLS-dən (`can_manage_tools()`). Əməliyyatlar tam tam ədədlərlədir (kəsr yoxdur).
- Depo: `is_storekeeper()`, `can_manage_tools()` (= **istənilən admin** və ya aktiv depo məsulu, 0084); RPC `give_tool(p_tool_id, p_employee_id, p_quantity)` və `return_tool(p_assignment_id, p_quantity)` (hissə-hissə qaytarma; qaytarılan hissə bağlı sətir kimi tarixçədə qalır; ikisi də `security invoker`, yetki RLS-dən). Trigger-lər: `tool_assignments_check_stock` (depodakından çox vermək olmur, alət sətri kilidlənir), `tools_guard_stock` (say ustalardakından az ola bilməz; ustada olan alət silinmir), `employees_guard_storekeeper` (`is_storekeeper`-i yalnız admin dəyişir), `tool_assignments_only_masters` (alət yalnız aktiv ustaya, rəhbərliyə yox).
- `handle_new_user`: yeni auth istifadəçisi → `profiles` sətri. `rls_auto_enable`: yeni cədvəldə RLS-i avtomatik açır.

### Yetkilər (RLS)
- **Üç səviyyə:** sahib (müdir, `profiles.is_owner`) → admin → usta (worker). Qonaq (anon) yalnız saytın açıq məlumatlarını oxuyur.
- Giriş edən hər kəs iş cədvəllərini oxuyur (companies, stores, employees, tools, work_logs…).
- **Depo** (`tools`, `tool_assignments`, `material_pieces`): yazmaq **adminlər və depo məsulu** (`can_manage_tools()`, 0084); say yalnız təsdiqli sənədlə dəyişir. Usta: yalnız öz təhvilində "Aldım/Almadım", qaytarma və alət istəmə sorğusu (`depot_return_create`, `depot_request_create`, `depot_request_cancel`). `depot_requests`: depo + sənədin ustası/yazanı oxuyur; `stock_movements`: depo + öz hərəkətləri; birbaşa yazmaq yoxdur (yalnız funksiyalar).
- **Admin** (rəhbərlik hesabı): şirkət, mağaza, usta yazır (sayt məzmununu **yalnız müdir**, 0069); hər əməkdaşın şəkli və telefonu; müraciətləri oxuyur, dəyişir, silir. İş qeydi **açmır**.
- **Rəhbərlik (`is_management`) sətirlərini yalnız sahib yazır**; sahib öz kartını dəyişə və silə bilməz.
- **Usta**: yalnız öz iş qeydini (və fayllarını) əlavə edir; dəyişmək və silmək: sahibi və ya admin.
- **Profil şəkli**: hər kəs öz şəklini, istənilən admin (rəhbər) hamınınkını (storage də: öz qovluğu və ya admin; 0069).
- `profiles`: istifadəçi yalnız öz `full_name`-ini dəyişir; özünü və ya admin hamını görür.
- Sayt cədvəlləri (`site_*`): anon və authenticated oxuyur, admin yazır. `contact_requests`: hamı **yalnız əlavə edir**, oxumaq admin. Anon üçün oxu qaydaları ayrıdır, çünki anon `is_admin()`-i çağıra bilmir.

### Storage
| Bucket | Açıq | Limit | Yol / yetki |
|---|---|---|---|
| `work` | yox (imzalı link) | 10 MB; jpeg/png/webp/heic/pdf | `<log_id>/<uuid>.<ext>`; yükləmək usta özü, silmək sahibi/admin |
| `avatars` | bəli | 2 MB; webp/jpeg/png | `<əməkdaş_id>/<uuid>.webp`, brauzer 512px kvadrat WebP edir; öz qovluğu və ya müdir |
| `site` | bəli | 3 MB; webp/jpeg/png | `segments/`, `equipment/`, `services/`, `logo/`, `hero/`, `about/`; yalnız admin |
| `depot` | yox (imzalı link) | 5 MB; jpeg/png/webp/heic/pdf | `<YYYY-MM>/<uuid>.<ext>` (qaimə, xarab şəkli); oxu/yüklə `can_manage_tools()` |

Storage-də `remove` faylı həmişə dərhal silmir; köhnə şəkillər bucket-də qala bilər.

### Realtime
- Publikasiya `supabase_realtime`-da: `contact_requests` (yalnız admin alır), `tasks`, `attendance`, `leave_requests`, `attendance_absences`, `mileage_logs`, `fuel_payments`, `depot_requests`, `tool_assignments` (giriş edən hər kəs, RLS-ə görə). Web-də kanal sessiya yüklənəndən sonra açılır (`supabase.realtime.setAuth`), yoxsa anon kimi qoşulur və hadisə gəlmir.

### Miqrasiyalar (`supabase/migrations/`, bu repoda)
- `0001`–`0105`. Ad formatı `NNNN_ad.sql`; Supabase MCP `apply_migration` ilə tətbiq et və faylı da yaz.
- Mühüm olanlar:
  - 0114: `feed_seen (user_id, grp, seen_at)` — Qruplar lentinə son baxış (hər istifadəçi × qrup), `my_feed_seen()` (yoxdursa indi yazır) + `mark_feed_seen(p_grp, p_at)` (yalnız irəli); əvvəl cihaz yaddaşında idi, nişan hər girişdə yanırdı;
  - 0105: `announcement_reads` (istifadəçinin Elanlar səhifəsinə son baxışı) + `unread_announcements()` (sonra başqasının yazdığı elanlar) + `mark_announcements_seen()`; menyuda "Elanlar" nişanı admin `fetchNavBadges.announce` və web `lib/announcements-live`; canlı: admin `AnnouncementsListener`, web panel kanalı `onAnnouncementChange` (tost + səs, push gəlməsə də);
  - 0104: `push_subscribe` atomik upsert (`on conflict (endpoint) do update`): əvvəl sil + əlavə et idi, paralel iki çağırış (dev-də StrictMode) 409 Conflict verirdi; klientdə `refreshPush` eyni anda gələn çağırışı birləşdirir;
  - 0103: `storage.objects` AFTER DELETE trigger-i (`work_files_on_storage_delete`): `work` bucket-indən fayl silinəndə `work_files` sətri də silinir (əvvəl panel-dən silinən video/akt üçün nişan qalırdı); bir dəfəlik faylı olmayan sətirlər təmizləndi (2026-11-05, 10 sətir);
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
  - 0031: alət yalnız aktiv ustaya verilir (trigger `tool_assignments_only_masters`; rəhbərlik ala bilməz);
  - 0032: depoda materiallar (mis boru, qaz balonu...): `tools.kind` (`tool`/`material`), `tools.unit`, `tool_stock`-a bu sütunlar.
  - 0033: materialın istifadəsi: `tool_assignments.used`, cədvəl `material_pieces` (depodakı qalıq parçalar), `tool_stock.pieces_count/pieces_total`, RPC `finish_material`, `give_piece`.;
  - 0034: `give_piece`-ə `p_amount`: parçanın bir hissəsini ustaya vermək (qalan hissə parça kimi qalır);
  - 0036: qablaşdırılmış material (qaz balonu...): `tools.pack_name` (balon), `tools.pack_size` (hər qabda 11), `tool_stock`-a bu sütunlar; daxildə hər şey ölçü vahidi ilə (44 kq), qab yalnız daxiletmə və göstəriş üçün ("44 kq (4 balon)");
  - 0039: `tasks` cədvəli (iş tapşırıqları), RLS və `tasks_guard` tətikçisi;
  - 0056: `tasks` Realtime-da (replica identity full);
  - 0057: tapşırıq hüquqları: admin yalnız verir və **geri alır** (`task_withdraw`, istəsə başqa ustaya; `cancelled_at/by`, `reassigned_to`), "görüldü"nü yalnız usta qoyur, silmək yoxdur;
  - 0058/0064: iş qeydinə xəta kodu (0058) istifadəçi qərarı ilə ləğv olundu, sütun silindi (0064);
  - 0059: davamiyyət: `attendance` (check_in), `leave_requests` (usta istəyir, `leave_decide` admin), Realtime;
  - 0060: `work_log_materials` (iş qeydində işlədilən material; yalnız məlumat, depoda say dəyişmir);
  - 0061: `attendance.checked_out_at`, `check_out` ("İşi bitirdim");
  - 0062: bazar günü də `check_in` (əlavə gün);
  - 0063: `leave_cancel` (usta icazədən imtina edir; başlayıbsa keçmiş günlər qalır), status `cancelled`;
  - 0095: **qablı materialın mədaxili** (istifadəçi: "3 kq R410 mədaxil olsa, Açıq olan-da görünsün"): `depot_decide` `receipt` budağı — `tools.pack_name` + `pack_size` olan materialda tam balonlar `tools.quantity`-yə, qalıq `material_pieces`-ə (açıq balon) yazılır (məs. 3 kq → "Açıq olan: 3 kq"); qablı olmayan material və alət əvvəlki kimi. Köhnə sənəd bu qaydadan əvvəl təsdiqlənibsə qalıq tam hissəyə qatılmış olur (TEST Freon R410 üçün əl ilə düzəldilib);
  - 0096–0099 (2026-11-02): **push bildirişləri** (Web Push). `push_subscriptions` (istifadəçinin cihazları, `app` web/admin; yazmaq yalnız RPC `push_subscribe`/`push_unsubscribe`), `notifications` (növbə + tarixçə, `sent_at`), statement trigger `notifications_dispatch` → `pg_net` → Edge Function `push` (verify_jwt; baza ictimai anon açarla çağırır, 0099; funksiya yalnız `sent_at` boş olanı göndərir, 404/410 abunəliyi silir; secret `VAPID_PRIVATE_KEY`). Köməkçilər `notify_user/notify_employee/notify_all` (əməliyyatı edənə getmir). Hadisələr (0097): yeni tapşırıq (deferred constraint trigger — commit anında `reassigned_to` görünür), geri alma/yönləndirmə, qrupa qoşulma/çıxma, yanacaq pulu (`pending`), depodan verilən (`tool_assignments`, `received_at` boş), icazə cavabı, komanda (yeni/deaktiv/silinən əməkdaş → hamıya). 0098: `announcements` (elanlar; göndərmək `is_management()` = admin və ya rəhbərlik kartı; silmək admin/müəllif) → hamıya bildiriş; Realtime-da.
  - 0094: `work_file_counts(p_log_ids)` (security invoker): fayl nişanları qrup üzrə BİR sorğuda (`fetchFileCounts` admin + web); əvvəl 3 ardıcıl sorğu Paneli 11 san.-yə qədər uzadırdı. Eyni gün: `AuthProvider` yoxlaması bir dəfə (`loadOnce`: yalnız `onAuthStateChange`, istifadəçiyə görə keş; əvvəl 4 dəfə), Panel qrup xəritəsi + fayl sayı paralel. Panel: 71 sorğu/11,4 san. → 52/3,1 san. (dev, StrictMode ilə);
  - 0093: **performans** (Supabase advisors): 16 xarici açar indeksi (`tasks.work_log_id`, `work_logs.store_id/company_id`, `tool_assignments.employee_id` və s.), `auth.uid()`/`is_admin()` RLS-də `(select ...)` ilə (sorğuda bir dəfə), "yazır" (FOR ALL) qaydaları INSERT/UPDATE/DELETE-ə bölündü (15 cədvəl: ad + " (əlavə)/(dəyiş)/(sil)"), `leave_requests` DELETE bir qayda; yetkilər dəyişməyib (usta/admin adından yoxlanıb). Yeni RLS yazanda: funksiyanı `(select fn())` ilə yaz, oxu qaydası olan cədvəldə yazmanı `for all` yox, ayrı əmrlərlə;
  - 0092: 0090/0091 geri alındı ("Komandanın spidometrləri" ləğv): spidometr yenə yalnız özü + admin, `my_has_car()` silindi;
  - 0091: 0090 dəqiqləşdi: başqasının spidometrini yalnız **maşını olan** usta görür (`my_has_car()`), öz qeydini hər kəs, admin hamısını;
  - 0090: `mileage_logs` və `mileage` bucket oxu: hər usta (hamının spidometr km-i və şəkli; usta paneli Yanacaq → "Komandanın spidometrləri"); yazmaq əvvəlki kimi; `fuel_payments` yenə yalnız özü + admin;
  - 0089: iş qeydinə video: `work_files.kind` + `'video'`, `work` bucket 50 MB + `video/mp4` (sıxma web `lib/video.ts`-də, ətraflı web `CLAUDE.md`; R2-yə köçürülməsi planlaşdırılır); admin `WorkLogModal`-da video akt/şəkillərlə bir sırada plitədir (ilk kadr + ▶), klik → iç-içə pəncərədə oynayır; **işi açmadan görünsün deyə** (istifadəçi): "Görülən işlər" sətrində `FileBadges` (bənövşəyi "▶ Video", şəkil sayı, Akt; qrup işində qrupun bütün qeydlərindən), bağlı qrup başlığında "▶ Video"; Tapşırıqlar sətrində və bağlı qrup başlığında `VideoBadge`; ortaq `components/work/FileBadges.tsx` + `lib/jobs.ts` `fetchFileCounts` (qrup üzrə): Panel "İş qeydləri", `AllLogsModal`, `WorkTab` ("Qrupun faylları");
  - **Konum jurnalı admində (2026-10-28)**: şirkət/market səhifəsinin başlığında "Konum dəyişiklikləri N" (`components/clients/LocationLog.tsx`, yalnız qeyd olanda görünür): şirkətin özü + filial/mağazaları üzrə `place_location_log` — kim, nə vaxt, köhnə → yeni ünvan, köhnə → yeni koordinat + yerdəyişmə (1 km-dən çox qırmızı), GPS ±m və ya "Əl ilə yazılıb", Google Maps keçidləri. `database.types.ts`-ə `place_location_log` əlavə olundu (admin + web);
  - 0088: iş qeydini yalnız sahibi dəyişir (admin dəyişmir); 0087: usta mağaza/filial/sabit məkanın koordinat və ünvanını `place_location_by_workers` funksiyası ilə düzəldir, hər dəyişiklik jurnalda;
  - 0086: **ustanın çoxlu istəyi**: `depot_requests.batch uuid`, `depot_request_create(..., p_batch)`; usta "Alət istə"də bir neçəsini işarələyir (hamısı eyni batch), depoda qrup kimi görünür: "Usta: N şey istəyir · X verilə bilər · Y depoda çatmır" + "Verilə bilənləri ver"; hər istəkdə "verilə bilər · depoda N" / "çatmır", çatmayanda "Qəbul" bağlıdır (✎ ilə az ver və ya rədd et), "Hamısını qəbul et" çatmayanları atlayır;
  - 0085: **kəsr miqdar** (istifadəçi: "qazı kq, ədəd və ya balon kimi seçim; 1 balon = 11,3 kq; 1 balon götürüb 3 kq işlədib qalanını qaytarsın"): depo say sütunları `numeric(12,2)` (tools, tool_assignments, material_pieces, depot_requests, stock_movements, work_log_materials), `tool_stock` yenidən yaradılıb, RPC-lər `numeric` qəbul edir; **alət yalnız tam ədəd** (tətikçi `depot_whole_tool_qty`). Qablı materialda (`pack_name` + `pack_size`) qaytarılanın tam balonları depoya, qalığı **açıq balon** (parça) kimi qayıdır (`settle_material`). UI: material formasında "Necə sayılır" (Ədəd / Kq / Metr / Litr / Balon + "1 balonda neçə kq"), göstəriş vergüllə (`fmt`, `parseQty`, `pieceWord` — `depotUtils`); təhvil (admin `HolderRow`, usta `MyTools` ReturnModal): "Qaytarır X kq/balon" + "Qalanı: işlədib | ustada qalır". Pəncərələr sadələşdirilib (istifadəçi: "gərəksiz şey istəmirəm"): Mədaxil = növ + siyahıdan seç / yeni ad + miqdar + qeyd 📎 ("Haradan gəlib" sahəsi yoxdur); alət pəncərəsi = 3 göstərici (Depoda / Ustalarda / Təmirdə və ya Açıq balonlar), sənəd düymələri, Ver, Kimdədir.
  - 0084: **depo nəzarəti** (yuxarıda "Depo"): `can_manage_tools()` = admin və ya depo məsulu; `depot_requests`, `stock_movements`, `tool_repairs`; `tool_assignments.received_at/disputed_at`; `tool_stock.in_repair`; tətikçilər `tools_guard_quantity`, `material_pieces_guard`; RPC `depot_receipt_create`, `depot_writeoff_create`, `depot_count_create`, `depot_return_create`, `depot_request_create`, `depot_request_cancel`, `depot_decide`, `assignment_confirm`, `tool_repair_send/finish`; bayraq `app.depot` (say yalnız funksiya içində dəyişir), `app.depot_request` (jurnalda yazan/təsdiqləyən); bucket `depot` (qapalı, 5 MB); Realtime `depot_requests`, `tool_assignments`;
  - 0083: təhlükəsizlik yoxlaması: `task_add_member` və `fuel_price_for` girişsiz (PUBLIC/anon) çağırılmır, yalnız `authenticated`. Yeni security definer funksiyada `revoke ... from public, anon` yaz (təkcə anon yetmir);
  - 0082: **Yanacaq canlı**: `mileage_logs` Realtime-a qoşuldu, `fuel_payments` replica identity full. Admin `TasksListener`: yürüş/ödəniş dəyişəndə `revalidate()`, usta "Aldım" → tost + səs, "Almadım" → qırmızı tost. Web `FuelLog`: ustanın öz kanalı (sessiya ilə), yeni ödənişdə tost "Şirkət yanacaq pulu verdi", dəyişiklikdə `load()`. Bilinən: bazadan birbaşa silinən ödəniş admin-də canlı yenilənmədi (web-də yeniləndi); admin özü silirsə səhifə yerində yenilənir. Admin kartında "Pul ver" yoxdur, yalnız başlıqda;
  - 0081 + **aylıq balans** (istifadəçi: "aldım basıbsa sonra almadım basa bilməsin; hesab aylıq borca görə, hər ayın öz hesabı"): `fuel_payment_confirm` `received`-dən sonra dəyişməyi bloklayır ("Almadım"dan sonra "Aldım" olar), web-də "Aldım"dan sonra düymələr yoxdur. **Balans həmişə AYIN balansıdır** (seçilmiş dövrün ayı: ayda verilən − ayda sərf), gün/həftə seçiləndə də; "Ümumi balans" götürülüb. Başlıqda Ayda sərf / Ayda verilən / Ayın balansı; kartda "Oktyabr 2026: Şirkət X borcludur"; "Pul ver" standart məbləği ayın borcu. "Pul ver" kartda və başlıqda (günləri açmadan);
  - 0080: **yanacaq pulunun ödənişi** (istifadəçi: "şirkətin verdiyi yanacaq pulu yazılsın; sərf 300, verilən 250 → 50 borclu, ya da tərsinə; balans; usta aldım/almadım, admində verildi/verilmədi"): `fuel_payments` (employee_id, day, amount, note, status `pending`/`received`/`disputed`, status_at); yazmaq yalnız admin, usta yalnız `fuel_payment_confirm(p_id, p_received)`; admin məbləği/günü dəyişəndə status `pending`-ə qayıdır (`fuel_payments_guard`, `app.fuel_confirm`); Realtime-da. **Balans = verilən − sərf** (mənfi: şirkət borcludur, müsbət: artıq verilib), dövr üzrə və ümumi (bütün vaxt). Admin Yanacaq: başlıqda Verilən / Balans / Ümumi balans; açılan hissədə balans zolağı + "Pul ver" (`PayModal`: tarix, məbləğ standart dövrün borcu, qeyd), ödənişlər siyahısı (ustanın cavabı: Gözləyir / Aldı / Almadığını deyir; sil), günlər cədvəlində "Verildi" sütunu (`DayPay`: "Ver", məbləğ standart günün sərfi). Web: başlıqda Aldığın / Balans / Ümumi balans, "Aldığım yanacaq pulu" siyahısı ("Aldım" / "Almadım"), cədvəldə "Alınan";
  - **Yanacaq hesabatı (2026-10-23)**: admin `pages/Fuel.tsx` və web `FuelLog.tsx` eyni quruluşdadır: dövr filtri "Gün / Həftə / Ay" (‹ ›, həftə bazar ertəsi–bazar, gələcəyə keçmir, standart Həftə; `rangeOf`), başlıqda HƏMİŞƏ bu günün hesabatı (km, litr, ₼, vəziyyət: bağlı / açıq / yazılmayıb) + ayrıca seçilmiş dövrün yanacaq pulu; cədvəl dövrə görə. Admin-də başlıq kartına kliklənən ustanı göstərir (standart birinci), kartda bu günün hesabatı + dövrün məbləği; qiymətlər ayrı zolaqda. Sınaq məlumatı: Əlizadə üçün 1–23 oktyabr (bazar günləri xaric) şəkilsiz yürüşlər bazaya admin adından yazılıb;
  - 0079: **yanacaq növü** (istifadəçi: "benzin və ya dizel, hərəsinin öz qiyməti; admin bir dəfə təyin etsin, dəyişsə yenidən dəyişsin"): `employees.fuel_type` (`petrol`/`diesel`; usta formasında "Benzin / Dizel" düymələri, kartda nişan, seçilməyibsə qırmızı "Yanacaq?"), `fuel_settings.petrol_price` + `diesel_price` (köhnə `price` benzinə köçürülüb, silinib), `mileage_logs.fuel_type` snapshot, `fuel_price_for(type)`; maşın yoxdursa sərf və növ də silinir. Admin Yanacaq: iki qiymət, hər maşında növ seçimi (saxlanınca `mileage_fill_missing`). Usta panelində qiymət maşının növünə görə, axşam km-dən sonra yaşıl "Günün yekunu": N km getdin = X ₼;
  - 0077-0078: **Yanacaq** (istifadəçi: "usta gündəlik spidometrin şəklini çəkib km yazır, səhər və axşam; km avtomatik, 100 km-ə sərf və yanacaq qiyməti üçün yer"): `employees.fuel_per_100`, `fuel_settings` (tək sətir, `price` AZN/l, admin yazır), `mileage_logs` (usta+gün unikal: `start_km/photo/at`, `end_km/photo/at`, snapshot `fuel_per_100`, `fuel_price`; hesablanan `km`, `liters`, `cost`), tətikçi `mileage_guard` (usta yalnız özü, yalnız bu gün, maşını olmalıdır; axşam km yazılanda/dəyişəndə hazırkı sərf və qiymət snapshot olur, sonra qiymət dəyişsə köhnə gün dəyişmir; usta snapshot-u dəyişə bilməz), qapalı bucket `mileage` (`<əməkdaş_id>/...`, özü və admin). 0078 `mileage_fill_missing()` (admin): sərf/qiymət olmadan bağlanmış günləri doldurur, Yanacaq səhifəsində qiymət və ya sərf saxlananda çağırılır. Admin `pages/Fuel.tsx` (`/yanacaq`, menyuda Komanda): ay seçimi, hazırkı qiymət, hər maşında 100 km-ə sərf, km/litr/məbləğ, günlərin cədvəli (şəkillər imzalı linklə). Web usta panelində `/yanacaq` (`components/work/FuelLog.tsx`; menyuda yalnız `has_car`, `navGroups(showDepot, showFuel)`): səhər və axşam addımı (şəkil WebP ≤1600px + km, bu gün ərzində "Dəyiş"), bu günün km/litr/məbləği, ayın cədvəli və cəmi. Usta formasında "100 km-ə sərf (litr)" sahəsi;
  - 0076: **ustanın maşını** (istifadəçi: "gələcəkdə benzin pulu hesablananda lazım olacaq"): `employees.has_car`, `car_plate` (böyük hərf, unikal: defis/boşluq nəzərə alınmır), `car_model` (istəyə görə); tətikçi `employees_car_normalize` maşın yoxdursa ikisini silir. Usta formasında "Maşın: Yoxdur / Var" (`CarFields`, gizli `car_form`; rəhbərlik formasında yoxdur, dəyərə toxunulmur), kartda və pəncərədə `.plate` nişanı; web usta panelində pəncərədə yalnız baxış. **Benzin hesabı hələ yoxdur** (gələcək iş);
  - 0075: briqadanın adı istəyə görə (`crews.name` null ola bilər, unikallıq yalnız adı olanlara); adsız briqada UI-da üzvlərin adları ilə (`crewLabel`: "Xəyyam + Fərhad");
  - 0074: bir usta yalnız bir briqadada (`crew_members.employee_id` unikal); formada başqa briqadadakı usta bağlıdır ("→ briqada"), draft-da qırmızı;
  - 0073: `task_add_member(p_task_id, p_employee_id)` (yalnız admin): qrupa sonradan usta əlavə et; tək tapşırıq qrupa çevrilir (`group_id` verilir, `app.task_add_member`); keçmiş, görülmüş tapşırıq və təkrar usta bloklanır;
  - 0072: `task_withdraw`: qrup üzvü geri alınıb başqasına veriləndə yeni sətir həmin qrupa qoşulur (`group_id` saxlanır; eyni usta qrupda iki dəfə olmur);
  - 0071: **qrup tapşırıqları və briqadalar**: `crews`, `crew_members` (hamı oxuyur, admin yazır); `tasks.group_id` (bir neçə ustaya eyni tapşırıq: hər üzvə sətir, eyni uuid; dəyişmir); `task_set_done`/`task_set_note` qrupun geri alınmamış bütün sətirlərini birlikdə dəyişir (`app.task_group`), hər üzvə öz iş qeydi yazılır (statistika üçün), təmir qeydi hamıya;
  - 0070: **keçmiş günün tapşırığı bağlıdır** (istifadəçi, 2026-10-23): `baku_today()`; `tasks_guard` keçmiş günə yeni tapşırığı, keçmiş tapşırıqda hər dəyişikliyi (görüldü, qeyd, geri alma) bloklayır; `task_set_done`/`task_set_note`/`task_withdraw` aydın xəta verir. FK `on delete set null` (iş, mağaza, şirkət, yeni tapşırıq silinəndə istinadın boşalması, `pg_trigger_depth() > 1`) həmişə keçir: əvvəl mağaza/şirkət silinməsi tapşırığı olan yerdə bloklanırdı;
  - 0069: rəhbərlərin hüquqları: saytın məzmununu (site_* + site bucket) **yalnız müdir** yazır; istənilən admin hər əməkdaşın şəklini (`set_employee_photo`, avatars) və telefonunu dəyişir; rəhbərlik kartında (və müdirin öz kartında) admin yalnız telefon/şəkil dəyişir (`employees_guard_management`);
  - 0068: `tasks_guard`: iş qeydi silinəndə bağlantının boşalmasına geri alınmış tapşırıqda da icazə (əvvəl silmə bloklanırdı); iş silməsi əvvəl qeydi, sonra faylları silir və alınmasa xəta göstərir;
  - 0067: admin cavablanmış icazə sorğularını silir (gözləyən yox);
  - 0066: gündə bir neçə seans: `attendance` hər seans bir sətir (unikal yalnız açıq seans üçün), "Yenidən işə çıxdım";
  - 0065: `attendance_absences` (admin "işdə olmayıb" qeyd edir, usta həmin gün check_in edə bilmir), Realtime;
  - 0055: istifadə olunmayan mətnlər silindi (hero üzən kartları `home.hero.temp*`, `home.hero.badge`, `service.cta`, `team.management`, `team.masters`);
  - 0054: `site_texts.contact.route*` (Əlaqə xəritəsində "Marşrut qur");
  - 0053: `site_texts.contact.map_reset` ("Ünvana qayıt");
  - 0052: `employees.worker_type` (usta / köməkçi / sürücü), `public_employees()` növü qaytarır (usta → köməkçi → sürücü sırası), mətnlər `team.type.*`;
  - 0051: `site_clients` silindi (müştəri bölməsi ləğv olundu), `site_texts.home.clients.title` silindi, `site_settings.hero_form_enabled` (hero formunu göstər/gizlət);
  - 0050: ana səhifənin inam hissələri: `site_stats`, `site_faq` (+ `site_clients`, 0051 ilə silindi) (RLS: qonaq aktivləri oxuyur, admin yazır) + `site_settings.instagram_url/facebook_url`; ilk məzmun: 3 rəqəm (real say) və 5 sual (saytdakı mətnlərdən);
  - 0049: boru (metr) parça qaydası: `material_small_to_pieces`, `give_tool` və `settle_material` yeniləndi;
  - 0048: `settle_material(p_assignment_id, p_used, p_returned)` (bir formada işlədilib + qaytarılır, qalan ustada qalır; 0047-dəki `consume_material` silindi);
  - 0047: `consume_material` (0048 ilə əvəz olundu);
  - 0046: müraciət formunun sürət limiti (`contact_requests_throttle`: eyni telefondan saatda 3, ümumi 10 dəq-də 20); trigger funksiyaları RPC-dən bağlandı;
  - 0045: xəta kodları üçün `ac_models` (kondisioner modelləri), `ac_error_codes.model_id` (model_series və brand_id silindi; mövcud kod yeni modelə köçürüldü);
  - 0044: xəta kodları: `ac_error_codes.brand_id` məcburi deyil, unikallıq model + kod üzrə (0045 ilə əvəz olundu);
  - 0041-0043: tapşırıqdan avtomatik iş qeydi (`tasks.work_log_id`, `tasks.note`, `task_set_done`, `task_set_note`, "Tapşırıq: " prefiksi);
  - 0040: Səbət (0038-dəki `trash` cədvəli, tətikçilər, `restore_trash`) ləğv olundu, silindi; 0038-dən yalnız `tools.min_stock` qalır;
  - 0038: `tools.min_stock` (minimum qalıq, `tool_stock`-a sütun) (Səbət hissəsi 0040 ilə silinib);
  - 0037: depo məsulunu istənilən admin təyin edir (əvvəl yalnız müdir): `employees_guard_storekeeper` `is_admin()` yoxlayır;
  - 0035: `material_pieces.original_length` (usta ilkin nə qədər qaytarıb; hissə veriləndə `length` azalır, ilkin qalır: sətir "1 metr · qalıb, ilkin 2 metr — Kərimov Orxan 2 metr qaytarıb" kimi oxunur).
- RLS dəyişikliyini simulyasiya olunmuş JWT ilə DO-blokunda yoxla: `set_config('request.jwt.claims', json_build_object('sub', <uuid>, 'role', 'authenticated')::text, true)`, `set local role authenticated`. Nəticəni `raise exception 'NƏTİCƏ ...'` ilə çıxar, bu da hər şeyi geri qaytarır.
- **Baza tipləri (2026-10-28)**: mənbə kökdə `supabase/database.types.ts` (Supabase MCP `generate_typescript_types` nəticəsi bura yazılır), sonra kökdə `node scripts/split-db-types.mjs` → admin və web `src/types/database/` (cədvəl/funksiya başına fayl, ≤ 100 sətir; əl ilə dəyişmə). Import: `import type { Tables, Database } from "@/types/database"`.

### Hesablar və məlumat
- **2026-10-24: iş məlumatı sıfırlandı** (istifadəçi: "sistemi təhvil veriləcək dərəcədə boş saxla"): tapşırıqlar, davamiyyət, icazələr, görülən işlər (+ fayl qeydləri, işlədilən material), yanacaq yürüşləri və ödənişləri, briqadalar, depoda bütün alət/materiallar və hərəkətlər (təhvil, sənəd, jurnal, təmir, parça) `truncate ... restart identity` ilə silindi. Qalır: əməkdaşlar (9) və hesablar, şirkətlər (7), mağazalar (410), sayt məzmunu, xəta kodları, maşın və yanacaq qiymətləri (istifadəçi saxlamağı seçdi), 1 sınaq müraciəti. Storage-də yetim fayllar qalıb (`work` 2, `mileage` 2): SQL ilə silinmir, Supabase → Storage-dən əl ilə.
- Sahib (müdir) = **Məmmədov Anar** (`xeyyamelizade5@gmail.com`), admin, employee id 8.
- Usta hesabı: `xeyyamalizade5@gmail.com` → **Əlizadə Xəyyam**, employee id 1. Diqqət: "e"/"a" fərqi.
- Rəhbərlik: id 7 Abdulov Ceyhun, id 8 Məmmədov Anar, id 9 Mirmanafov Mirsadiq.
- Marketlər: "Araz Market" (id 4, 200 mağaza, kodlar `ARZ-001…`), "TEST Oba Market" (id 6, 200 mağaza, `OBA-001…`). Mağazalar `excel/*-market-200.xlsx`-dən import olunub, məlumat uydurmadır. İstifadəçi "TEST" sözünü adlardan hələlik götürməmək dedi.
- Şirkətlər: Rabitə Bank (id 7, 10 filial), Qarabağ Stadion, Knightsbridge Residence, Port Baku Residence, İzmir Villa (filialsız, sabit məkan).
- 2026-10-18: iş qeydləri, tapşırıqlar və fayl qeydləri istifadəçi istəyi ilə **hamısı silindi** (baza təmizdir); `work` bucket-ində `32/` qovluğunda 2 yetim şəkil qalıb (SQL ilə silinmir, Storage panelindən əl ilə). Xəta kodları: bütün köhnə kodlar (real `Daikin VRV · U4` və `TEST` sınaq kodları) istifadəçi istəyi ilə silinib; bazada yalnız yuxarıdakı 334 Daikin kodu var (`Daikin VRV` modeli boşdur). Müraciətlər: istifadəçinin yazdığı sınaq müraciətlər var.
