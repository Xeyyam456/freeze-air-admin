import { useState } from "react";
import type { ClientInfoCardProps } from "@/types/clients";
import { ClientEditModal } from "../ClientEditModal";
import { ClientCardHeader } from "./ClientCardHeader";
import { ClientContactCells } from "./ClientContactCells";
import { Card } from "@/shared/components/Card";

// Şirkət/market məlumat kartı (vizit kartı)
export function ClientInfoCard(props: ClientInfoCardProps) {
  const { company, kind } = props;
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      {editing && <ClientEditModal company={company} kind={kind} onClose={() => setEditing(false)} />}
      <ClientCardHeader {...props} onEdit={() => setEditing(true)} />
      <ClientContactCells company={company} kind={kind} />
      {company.notes && <p className="muted mt-3 line-clamp-2 text-sm">{company.notes}</p>}
    </Card>
  );
}
