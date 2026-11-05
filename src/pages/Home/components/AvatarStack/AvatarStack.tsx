import type { AvatarStackProps } from "@/types/dashboard";
import s from "./AvatarStack.module.css";

const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// Üst-üstə düşən avatarlar; artığı "+N"
export function AvatarStack({ people, max = 5 }: AvatarStackProps) {
  const shown = people.slice(0, max);
  return (
    <div className={s.root}>
      {shown.map((p) => (
        <span key={p.full_name} className={s.avatar} title={p.full_name}>
          {p.photo_url ? <img src={p.photo_url} alt={p.full_name} /> : initials(p.full_name)}
        </span>
      ))}
      {people.length > max && <span className={`${s.avatar} ${s.more}`}>+{people.length - max}</span>}
    </div>
  );
}
