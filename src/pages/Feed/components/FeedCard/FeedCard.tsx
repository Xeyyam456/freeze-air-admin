import { MapPin, Users } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { Card } from "@/shared/components/Card";
import type { FeedCardProps } from "@/types/feed";
import { timeBaku } from "@/shared/utils/timeBaku";
import { partnerText } from "../../utils/partnerText";
import { FeedActions } from "../FeedActions";
import { FeedFiles } from "../FeedFiles";

// Lent kartı (mobil ilə eyni): usta + vaxt, yer (rəngli), birlikdə işləyən ustalar, yazı, fayllar (3-3 düz sıra), altda 💬 və 👍/👎.
// Birlikdə işləyən 2+ nəfər olsa "Birlikdə:" altında hər biri ayrı sətirdə (ad və soyad)
export function FeedCard(props: FeedCardProps) {
  const { post } = props;
  return (
    <Card as="article" className="grid gap-3.5">
      <div className="flex items-center gap-3">
        <Avatar employee={{ full_name: post.name, photo_url: post.photo }} className="!h-10 !w-10 !text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold">{post.name}</p>
          <p className="muted text-xs font-semibold">{timeBaku(post.at)}</p>
        </div>
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-lg font-extrabold text-cyan-300"><MapPin size={18} className="shrink-0" />{post.place}</p>
        {post.company && <p className="muted ml-6 text-xs font-semibold">{post.company}</p>}
      </div>
      {post.partners.length > 0 && (
        <div className="text-xs font-bold text-primary">
          <p className="flex items-center gap-1.5"><Users size={12} />{post.partners.length === 1 ? partnerText(post.partners) : "Birlikdə:"}</p>
          {post.partners.length > 1 && post.partners.map((n) => <p key={n} className="pl-[18px]">{n}</p>)}
        </div>
      )}
      {post.description && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed opacity-90">{post.description}</p>}
      <FeedFiles post={post} />
      <FeedActions {...props} />
    </Card>
  );
}
