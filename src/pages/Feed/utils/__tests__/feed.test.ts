import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { dayHeading } from "@/pages/Feed/utils/dayHeading";
import { bakuDay, feedWhen } from "@/pages/Feed/utils/feedWhen";
import { groupByDay } from "@/pages/Feed/utils/groupByDay";
import { isImage } from "@/pages/Feed/utils/isImage";
import { partnerText, withIle } from "@/pages/Feed/utils/partnerText";
import { searchPosts } from "@/pages/Feed/utils/searchPosts";
import type { FeedFile, FeedPost } from "@/types/feed";

// "İndi": 2026-11-09 12:00 Bakı (bazar ertəsi)
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-09T08:00:00Z"));
});
afterAll(() => vi.useRealTimers());

const post = (logId: number, at: string, p: Partial<FeedPost> = {}) =>
  ({ logId, at, place: "", company: null, name: "", partners: [], description: "", ...p }) as FeedPost;

describe("gün başlığı və vaxt", () => {
  it.each([
    ["2026-11-09", "Bu gün"], ["2026-11-10", "Bu gün"], ["2026-11-08", "Dünən"],
    ["2026-11-06", "Cümə"], ["2026-11-03", "Çərşənbə axşamı"], ["2026-11-02", "2 noyabr 2026"],
  ])("dayHeading(%s) → %s", (d, want) => expect(dayHeading(d)).toBe(want));

  it.each([
    ["2026-11-09T05:02:00Z", "Bu gün 09:02"],
    ["2026-11-08T20:30:00Z", "Bu gün 00:30"], // UTC-də dünən, Bakıda bu gün
    ["2026-11-08T10:00:00Z", "Dünən 14:00"],
    ["2026-11-06T10:02:00Z", "06.11.2026 14:02"],
  ])("feedWhen(%s) → %s", (t, want) => expect(feedWhen(t)).toBe(want));

  it("bakuDay: gecə yarısından sonra Bakı tarixi", () => {
    expect([bakuDay("2026-11-08T19:59:00Z"), bakuDay("2026-11-08T20:00:00Z")]).toEqual(["2026-11-08", "2026-11-09"]);
  });

  it("groupByDay: Bakı gününə görə bölünür, sıra saxlanır", () => {
    const g = groupByDay([post(1, "2026-11-09T05:00:00Z"), post(2, "2026-11-08T21:00:00Z"), post(3, "2026-11-08T10:00:00Z")]);
    expect(g.map((d) => [d.day, d.posts.map((p) => p.logId)])).toEqual([["2026-11-09", [1, 2]], ["2026-11-08", [3]]]);
  });
});

describe("fayllar və birlikdə işləyənlər", () => {
  it("isImage: şəkil və aktın şəkli bəli; video, PDF, linksiz yox", () => {
    const f = (kind: FeedFile["kind"], path: string, url?: string) => isImage({ id: 1, kind, path, url });
    expect([f("photo", "a.webp", "u"), f("act", "akt.webp", "u"), f("video", "v.mp4", "u"), f("act", "akt.pdf", "u"), f("photo", "a.webp")])
      .toEqual([true, true, false, false, false]);
  });

  it.each([
    ["Fərhad", "Fərhadla"], ["Nigar", "Nigarla"], ["Orxan", "Orxanla"], ["Elçin", "Elçinlə"],
    ["Rüstəm", "Rüstəmlə"], ["Əli", "Əliylə"], ["Ülvi", "Ülviylə"], ["Məmmədov Fərhad", "Məmmədov Fərhadla"],
  ])("withIle(%s) → %s", (n, want) => expect(withIle(n)).toBe(want));

  it("partnerText", () => {
    expect(partnerText(["Fərhad"])).toBe("Fərhadla birlikdə");
    expect(partnerText(["Anar", "Elçin", "Əli"])).toBe("Anar, Elçin və Əliylə birlikdə");
  });
});

describe("searchPosts — ə/ı/ö/ü/ş/ç/ğ yumşaldılır, bütün sözlər tapılmalıdır", () => {
  const posts = [
    post(1, "2026-11-06T10:00:00Z", { place: "Araz · ARZ-045 Nərimanov", company: "Araz", name: "Məmmədov Fərhad", partners: ["Əlizadə Xəyyam"], description: "Freon dolduruldu" }),
    post(2, "2026-11-09T05:00:00Z", { place: "Port Baku", name: "Quliyev Anar", description: "Filtr təmizləndi" }),
  ];
  const ids = (q: string) => searchPosts(posts, q).map((p) => p.logId);
  it.each([
    ["nerimanov", [1]], ["Fərhad freon", [1]], ["ferhad xeyyam", [1]], ["ARZ-045", [1]], ["temizlendi", [2]],
    ["06.11.2026", [1]], ["2026-11-09", [2]], ["bu gün", [2]], ["  ", [1, 2]], ["fərhad filtr", []],
  ] as const)("%j → %j", (q, want) => expect(ids(q)).toEqual(want));
});
