import { ShieldCheck } from "lucide-react";
import { PersonCard } from "@/shared/components/PersonCard";
import type { ManagerCardProps } from "@/types/management";
import { useManagerModals } from "../../hooks/useManagerModals";
import { ManagerActions } from "../ManagerActions";
import { ManagerModals } from "../ManagerModals";

export function ManagerCard(props: ManagerCardProps) {
  const { manager, isMe } = props;
  const m = useManagerModals();
  return (
    <>
      <ManagerModals card={props} state={m} />
      <PersonCard
        person={manager}
        subtitle={manager.position ?? "Rəhbərlik"}
        badge={isMe ? "Sən" : undefined}
        highlight={isMe}
        actions={<ManagerActions {...props} onEdit={m.edit} onContact={m.openContact} />}
        footer={manager.user_id
          ? <span className="flex items-center gap-1.5 text-ok"><ShieldCheck size={13} /> Admin hesabı var</span>
          : <span className="muted flex items-center gap-1.5"><ShieldCheck size={13} /> Hesab açılmayıb</span>}
        onOpen={m.open}
      />
    </>
  );
}
