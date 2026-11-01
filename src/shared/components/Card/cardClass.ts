import s from "@/shared/styles/Card.module.css";

const join = (...p: (string | false)[]) => p.filter(Boolean).join(" ");

// Kart görünüşü: Card və kart kimi görünən başqa elementlər (<Link>, <li>, <form>)
export const cardClass = (extra = "") => join(s.root, extra);
// Üzərinə gələndə qalxan keçid kartı
export const cardLinkClass = (extra = "") => join(s.root, s.link, extra);
// Kartın başlığı (<h2 className={cardTitleClass()}>)
export const cardTitleClass = (extra = "") => join(s.title, extra);
