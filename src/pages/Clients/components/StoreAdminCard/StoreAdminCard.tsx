import { IconButton } from "@/shared/components/IconButton";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteStore } from "@/services/clients/storeMutations";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StoreCard } from "@/components/StoreCard";
import { KIND } from "@/lib/kinds";
import type { StoreAdminCardProps } from "@/types/clients";
import { EditStoreModal } from "./EditStoreModal";

// Şirkət/market səhifəsindəki kart: redaktə ayrıca modalda açılır
export function StoreAdminCard({ store, kind }: StoreAdminCardProps) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <StoreCard store={store} action={
        <div className="flex shrink-0 items-center gap-1">
          <IconButton onClick={() => setEditing(true)} title="Redaktə et" aria-label="Redaktə et">
            <Pencil size={16} />
          </IconButton>
          <ConfirmButton onConfirm={() => deleteStore(store.id)} icon danger title={`${KIND[kind].UnitAcc} sil`}>
            <Trash2 size={16} />
          </ConfirmButton>
        </div>
      } />
      {editing && <EditStoreModal store={store} kind={kind} onClose={() => setEditing(false)} />}
    </>
  );
}
