import type { TextGroup } from "@/types/site";

export const TEAM_TEXTS: TextGroup = {
  id: "team",
  title: "Ustalarımız",
  hint: "Ustalar və rəhbərlik (ad, vəzifə, şəkil) “Ustalar” və “Rəhbərlik” səhifələrindən gəlir.",
  sections: [
    {
      title: "Ustalarımız səhifəsi",
      fields: [
        { key: "team.title", label: "Başlıq" },
        { key: "team.lead", label: "Alt mətn", kind: "text" },
        { key: "team.empty", label: "Usta yoxdursa" },
        { key: "team.specialty", label: "İxtisas yazılmayıbsa" },
        { key: "team.experience", label: "Təcrübə yazısı" },
        { key: "team.new", label: "Təcrübə yoxdursa" },
        { key: "team.cta_text", label: "Sol panel: çağırış mətni" },
        { key: "team.cta_button", label: "Sol panel: düymə" },
        { key: "team.type.master", label: "İş növü: usta (sayda və nişanda)" },
        { key: "team.type.assistant", label: "İş növü: köməkçi" },
        { key: "team.type.driver", label: "İş növü: sürücü" },
      ],
    },
  ],
};
