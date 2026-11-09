import { describe, expect, it } from "vitest";
import { mapEmbedUrl, mapSearchUrl, parseCoordinates } from "@/lib/navigation";
import { norm } from "@/shared/utils/norm";
import { nameKey } from "@/services/depot/toolForm";
import { slugify } from "@/pages/Site/utils/slugify";

describe("norm — axtarış üçün sadələşdirmə", () => {
  it.each([
    ["Əlizadə", "elizade"], ["Şəki", "seki"], ["Gəncə", "gence"], ["Ağcabədi", "agcabedi"],
    ["Göygöl", "goygol"], ["Üzüm", "uzum"], ["Çay", "cay"], ["Qazıməmməd", "qazimemmed"],
  ])("%s → %s", (s, want) => expect(norm(s)).toBe(want));

  it("null / undefined → boş", () => {
    expect([norm(null), norm(undefined), norm("")]).toEqual(["", "", ""]);
  });

  it("böyük/kiçik hərf və yumşaltma birlikdə: eyni nəticə", () => {
    expect(norm("MƏMMƏDOV")).toBe(norm("məmmədov"));
    expect(norm("Qüdrət")).toBe("qudret");
  });
});

describe("böyük İ və I (Azərbaycan qaydası) — əvvəl \"i\" + görünməz U+0307 verirdi", () => {
  it.each([["İlqar", "ilqar"], ["İSMAYILLI", "ismayilli"], ["ŞİRVAN", "sirvan"], ["LG INVERTER", "lg inverter"]])("norm(%s) → %s", (s, want) => {
    expect(norm(s)).toBe(want);
  });
  it("axtarış: kiçik hərflə yazanda tapılır", () => expect(norm("İsmayılov İlqar").includes(norm("ilqar"))).toBe(true));
  it("nameKey: eyni alət adı təkrar sayılır", () => {
    expect(nameKey("İnverter  Kondisioner")).toBe(nameKey("inverter kondisioner"));
    expect(nameKey("MIS BORU")).toBe(nameKey("Mis boru"));
  });
  it("slugify: \"İnşaat işləri\" → insaat-isleri", () => {
    expect(slugify("İnşaat işləri")).toBe("insaat-isleri");
    expect(slugify("Ev və mənzil")).toBe("ev-ve-menzil");
  });
});

describe("parseCoordinates — Google Maps-dən kopyalanan", () => {
  it.each([
    ["40.40930, 49.86710", { lat: 40.4093, lng: 49.8671 }],
    ["  40.4093,49.8671 ", { lat: 40.4093, lng: 49.8671 }],
    ["-33.8, 151", { lat: -33.8, lng: 151 }],
  ])("%s", (s, want) => expect(parseCoordinates(s)).toEqual(want));

  it.each(["", "40.4", "40,4 49,8", "91, 49", "40, 181", "Bakı"])("yanlış: %j → null", (s) => {
    expect(parseCoordinates(s)).toBeNull();
  });
});

describe("xəritə linkləri", () => {
  it("koordinat varsa dəqiq nöqtə, yoxsa ünvan", () => {
    expect(mapSearchUrl({ lat: 40.4, lng: 49.8, address: "x" })).toBe("https://www.google.com/maps/search/?api=1&query=40.4%2C49.8");
    expect(mapSearchUrl({ lat: null, lng: null, address: "Nərimanov 5" })).toBe(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Nərimanov 5")}`);
    expect(mapEmbedUrl({ lat: null, lng: null, address: null })).toBe("https://www.google.com/maps?q=&z=16&output=embed");
  });
});
