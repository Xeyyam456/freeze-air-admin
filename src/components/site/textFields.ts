// Saytın sabit mətnlərinin siyahısı (cədvəl site_texts). Açarlar web/src/lib/site-texts.ts ilə eynidir.
// kind: "line" bir sətir, "text" uzun mətn, "list" hər sətir bir bənd.
export type TextField = { key: string; label: string; kind?: "line" | "text" | "list" };
export type TextGroup = { id: string; title: string; hint?: string; sections: { title: string; fields: TextField[] }[] };

export const TEXT_GROUPS: TextGroup[] = [
  {
    id: "common",
    title: "Ümumi",
    hint: "Bütün səhifələrdə: header, menyu, footer.",
    sections: [
      {
        title: "Brend və header",
        fields: [
          { key: "brand.name", label: "Şirkətin adı (loqo yanında, footer, brauzer tabı)" },
          { key: "brand.tagline", label: "Adın altındakı yazı" },
          { key: "header.cta", label: "Header düyməsi" },
          { key: "header.login", label: "Giriş düyməsi (qonaq)" },
          { key: "header.panel", label: "Panel düyməsi (giriş edən usta)" },
        ],
      },
      {
        title: "Menyu",
        fields: [
          { key: "nav.home", label: "Əsas" },
          { key: "nav.equipment", label: "Avadanlıq" },
          { key: "nav.services", label: "Xidmətlər" },
          { key: "nav.how", label: "Necə işləyirik" },
          { key: "nav.team", label: "Ustalarımız" },
          { key: "nav.contact", label: "Əlaqə" },
        ],
      },
      {
        title: "Footer",
        fields: [
          { key: "footer.text", label: "Loqo altındakı mətn", kind: "text" },
          { key: "footer.login", label: "Usta girişi düyməsi" },
          { key: "footer.pages", label: "1-ci sütunun başlığı" },
          { key: "footer.services", label: "2-ci sütunun başlığı" },
          { key: "footer.contact", label: "3-cü sütunun başlığı" },
          { key: "footer.copyright", label: "Ən aşağı, solda" },
          { key: "footer.slogan", label: "Ən aşağı, sağda" },
        ],
      },
    ],
  },
  {
    id: "home",
    title: "Ana səhifə",
    hint: "“Haqqımızda” mətni və şəkillər “Ana səhifə” tabındadır.",
    sections: [
      {
        title: "Hero (ən üst)",
        fields: [
          { key: "home.hero.badge_out", label: "Sol nişan" },
          { key: "home.hero.badge_in", label: "Sağ nişan" },
          { key: "home.hero.title", label: "Başlıq" },
          { key: "home.hero.lead", label: "Alt mətn", kind: "text" },
          { key: "home.hero.cta", label: "Birinci düymə" },
          { key: "home.hero.cta2", label: "İkinci düymə" },
          { key: "home.hero.temp_label", label: "Kiçik kart: yazı" },
          { key: "home.hero.temp", label: "Kiçik kart: rəqəm" },
          { key: "home.hero.badge", label: "Tünd nişan (şəklin üstü)" },
        ],
      },
      {
        title: "Haqqımızda",
        fields: [
          { key: "home.about.label", label: "Başlıq üstündəki yazı" },
          { key: "home.about.button", label: "Düymə" },
        ],
      },
      {
        title: "Obyektlər bölməsi",
        fields: [
          { key: "home.segments.title", label: "Başlıq" },
          { key: "home.segments.lead", label: "Alt mətn" },
          { key: "home.segments.more", label: "Kartdakı keçid" },
        ],
      },
      {
        title: "Xidmət kateqoriyaları (göy zolaq)",
        fields: [
          { key: "home.categories.title", label: "Başlıq" },
          { key: "home.categories.lead", label: "Alt mətn" },
          { key: "home.cat1.title", label: "1-ci kart: başlıq" },
          { key: "home.cat1.items", label: "1-ci kart: siyahı", kind: "list" },
          { key: "home.cat2.title", label: "2-ci kart: başlıq" },
          { key: "home.cat2.items", label: "2-ci kart: siyahı", kind: "list" },
          { key: "home.cat3.title", label: "3-cü kart: başlıq" },
          { key: "home.cat3.items", label: "3-cü kart: siyahı", kind: "list" },
        ],
      },
      {
        title: "Sürətli əlaqə (ən aşağı)",
        fields: [
          { key: "home.contact.label", label: "Başlıq üstündəki yazı" },
          { key: "home.contact.title", label: "Başlıq" },
          { key: "home.contact.text", label: "Alt mətn" },
          { key: "home.contact.phone", label: "Telefon yazısı" },
          { key: "home.contact.address", label: "Ünvan yazısı" },
          { key: "home.contact.hours", label: "İş saatları yazısı" },
          { key: "home.contact.button", label: "Düymə" },
        ],
      },
    ],
  },
  {
    id: "equipment",
    title: "Avadanlıq",
    hint: "Avadanlıq kartları “Avadanlıq” tabındadır.",
    sections: [
      {
        title: "Səhifə başlığı",
        fields: [
          { key: "equipment.title", label: "Başlıq" },
          { key: "equipment.lead", label: "Alt mətn", kind: "text" },
        ],
      },
    ],
  },
  {
    id: "services",
    title: "Xidmətlər",
    hint: "Hər xidmətin öz məzmunu “Xidmətlər” tabında, obyektlərin məzmunu “Obyektlər” tabındadır.",
    sections: [
      {
        title: "Xidmətlər səhifəsi",
        fields: [
          { key: "services.title", label: "Başlıq" },
          { key: "services.lead", label: "Alt mətn", kind: "text" },
          { key: "services.segments", label: "Obyektlər bölməsinin başlığı" },
          { key: "services.list", label: "Siyahının başlığı" },
          { key: "services.cta_text", label: "Aşağı zolaq: mətn" },
          { key: "services.cta_button", label: "Aşağı zolaq: düymə" },
        ],
      },
      {
        title: "Xidmət səhifəsi (hamısı üçün ortaq)",
        fields: [
          { key: "service.includes", label: "“Nə daxildir” başlığı" },
          { key: "service.steps", label: "“Necə edirik” başlığı" },
          { key: "service.aside_title", label: "Sağ blok: başlıq" },
          { key: "service.aside_text", label: "Sağ blok: mətn", kind: "text" },
          { key: "service.cta", label: "Düymə" },
          { key: "service.others", label: "Digər xidmətlər başlığı" },
          { key: "service.more", label: "Kartdakı keçid" },
        ],
      },
      {
        title: "Obyekt səhifəsi (hamısı üçün ortaq)",
        fields: [
          { key: "segment.cta", label: "Düymə" },
          { key: "segment.equipment", label: "Avadanlıq bölməsinin başlığı" },
          { key: "segment.issues", label: "Problemlər kartının başlığı" },
          { key: "segment.work", label: "Görülən işlər kartının başlığı" },
          { key: "segment.note_fallback", label: "Aşağı zolaq (obyektdə qeyd yoxdursa)" },
          { key: "segment.others", label: "Digər obyektlər başlığı" },
        ],
      },
    ],
  },
  {
    id: "how",
    title: "Necə işləyirik",
    sections: [
      {
        title: "Səhifə başlığı",
        fields: [
          { key: "how.title", label: "Başlıq" },
          { key: "how.lead", label: "Alt mətn", kind: "text" },
        ],
      },
      {
        title: "Addımlar",
        fields: [
          { key: "how.step1.title", label: "1-ci addım: başlıq" },
          { key: "how.step1.text", label: "1-ci addım: mətn", kind: "text" },
          { key: "how.step2.title", label: "2-ci addım: başlıq" },
          { key: "how.step2.text", label: "2-ci addım: mətn", kind: "text" },
          { key: "how.step3.title", label: "3-cü addım: başlıq" },
          { key: "how.step3.text", label: "3-cü addım: mətn", kind: "text" },
        ],
      },
      {
        title: "Tünd blok",
        fields: [
          { key: "how.deliverables", label: "Başlıq" },
          { key: "how.d1.title", label: "1: başlıq" },
          { key: "how.d1.text", label: "1: mətn", kind: "text" },
          { key: "how.d2.title", label: "2: başlıq" },
          { key: "how.d2.text", label: "2: mətn", kind: "text" },
          { key: "how.d3.title", label: "3: başlıq" },
          { key: "how.d3.text", label: "3: mətn", kind: "text" },
        ],
      },
    ],
  },
  {
    id: "team",
    title: "Ustalarımız",
    hint: "Ustalar və rəhbərlik (ad, vəzifə, şəkil) “Ustalar” və “Rəhbərlik” səhifələrindən gəlir.",
    sections: [
      {
        title: "Ustalarımız səhifəsi",
        fields: [
          { key: "team.title", label: "Başlıq" },
          { key: "team.lead", label: "Alt mətn", kind: "text" },
          { key: "team.management", label: "Rəhbərlik bölməsinin başlığı" },
          { key: "team.masters", label: "Ustalar bölməsinin başlığı" },
          { key: "team.empty", label: "Usta yoxdursa" },
          { key: "team.specialty", label: "İxtisas yazılmayıbsa" },
          { key: "team.experience", label: "Təcrübə yazısı" },
          { key: "team.new", label: "Təcrübə yoxdursa" },
          { key: "team.cta_text", label: "Aşağı zolaq: mətn" },
          { key: "team.cta_button", label: "Aşağı zolaq: düymə" },
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Əlaqə",
    hint: "Telefon, ünvan, saatlar və e-poçt “Əlaqə” tabındadır.",
    sections: [
      {
        title: "Əlaqə səhifəsi",
        fields: [
          { key: "contact.title", label: "Başlıq" },
          { key: "contact.lead", label: "Alt mətn", kind: "text" },
          { key: "contact.call_label", label: "Telefon üstündəki yazı" },
          { key: "contact.call", label: "Zəng düyməsi" },
          { key: "contact.whatsapp", label: "WhatsApp düyməsi" },
          { key: "contact.address", label: "Ünvan kartı" },
          { key: "contact.hours", label: "İş saatları kartı" },
          { key: "contact.email", label: "E-poçt kartı" },
        ],
      },
      {
        title: "“Bizə yazın” forması",
        fields: [
          { key: "form.title", label: "Başlıq" },
          { key: "form.lead", label: "Alt mətn" },
          { key: "form.name", label: "Ad sahəsi" },
          { key: "form.phone", label: "Telefon sahəsi" },
          { key: "form.email", label: "E-poçt sahəsi" },
          { key: "form.message", label: "Mesaj sahəsi" },
          { key: "form.submit", label: "Düymə" },
          { key: "form.sending", label: "Göndərilərkən düymə" },
          { key: "form.success_title", label: "Göndərildikdən sonra: başlıq" },
          { key: "form.success_text", label: "Göndərildikdən sonra: mətn", kind: "text" },
        ],
      },
    ],
  },
];
