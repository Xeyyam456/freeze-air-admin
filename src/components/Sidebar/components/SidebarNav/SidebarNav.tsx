import s from "../../styles/Sidebar.module.css";
import { Link } from "react-router";
import type { SidebarNavProps } from "@/types/layout";
import { BADGE_STYLE, BADGE_TITLE, GROUPS, isActive } from "../../utils/navGroups";

// Menyu qrupları və bəndləri (qırmızı nişanlarla); ownerOnly bəndlər yalnız müdirə görünür
export function SidebarNav({ collapsed, owner, pathname, badges }: SidebarNavProps) {
  return (
    <nav className={`${s.nav} nice-scroll`}>
      {GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.ownerOnly || owner) })).filter((g) => g.items.length > 0).map((g) => (
        <div key={g.title} className={s.group}>
          <p className={s.groupTitle}>{g.title}</p>
          {g.items.map(({ href, label, icon: Icon, badge }) => {
            const n = badge ? badges?.[badge] ?? 0 : 0;
            return (
              <Link key={href} to={href} className={s.link} title={collapsed ? label : undefined}
                aria-current={isActive(href, pathname) ? "page" : undefined}>
                <Icon size={18} strokeWidth={2.1} />
                <span className={`${s.text} flex-1 truncate`}>{label}</span>
                {!!n && (
                  <span className={`${s.badge} ${BADGE_STYLE}`} title={badge === "stock" ? badges?.stockTitle : `${n} ${BADGE_TITLE[badge!]}`}>{n}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
