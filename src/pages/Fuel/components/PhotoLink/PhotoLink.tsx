import { useEffect, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { mileagePhotoUrl } from "@/services/fuel/photos";
import { Modal } from "@/shared/components/Modal";
import type { PhotoLinkProps } from "@/types/fuel";

// Qapalı "mileage" bucket-indəki spidometr şəkli: "Şəkilə bax" düyməsi basanda imzalı linklə pəncərədə açılır
export function PhotoLink({ path, label }: PhotoLinkProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!open || !path) return;
    let cancelled = false;
    mileagePhotoUrl(path).then((u) => { if (!cancelled) setUrl(u); });
    return () => { cancelled = true; };
  }, [open, path]);
  if (!path) return <span className="muted inline-flex items-center gap-1 text-[11px]" title={`${label}: şəkil yoxdur`}><ImageIcon size={12} /> Şəkil yoxdur</span>;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-primary-soft px-2 py-1 text-[11px] font-semibold text-primary hover:brightness-95">
        <ImageIcon size={12} /> Şəkilə bax
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="km-photo-title" className="!max-w-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="km-photo-title" className="flex items-center gap-2 text-lg font-bold"><ImageIcon size={18} className="text-primary" /> Spidometr · {label}</h2>
            <button type="button" onClick={() => setOpen(false)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          {url
            ? <img src={url} alt={`Spidometr: ${label}`} className="max-h-[70vh] w-full rounded-xl object-contain ring-1 ring-line" />
            : <div className="h-64 animate-pulse rounded-xl bg-bg" />}
        </Modal>
      )}
    </>
  );
}
