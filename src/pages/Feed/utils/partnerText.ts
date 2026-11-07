// Azərbaycan dilində "ilə" şəkilçisi: son saitə görə la/lə, sait ilə bitirsə y əlavə olur ("Fərhad" → "Fərhadla", "Nigar" → "Nigarla")
const VOWELS = "aıoueəiöü";

export function withIle(name: string) {
  const low = name.toLocaleLowerCase("az");
  const last = [...low].reverse().find((ch) => VOWELS.includes(ch)) ?? "ə";
  const suffix = "aıou".includes(last) ? "la" : "lə";
  return VOWELS.includes(low.slice(-1)) ? `${name}y${suffix}` : `${name}${suffix}`;
}

// Bir sətirlik yazı: "Fərhadla birlikdə" / "A, B və Cilə birlikdə"
export const partnerText = (names: string[]) => `${names.length > 1 ? `${names.slice(0, -1).join(", ")} və ` : ""}${withIle(names[names.length - 1])} birlikdə`;
