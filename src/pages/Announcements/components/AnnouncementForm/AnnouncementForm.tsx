import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { createAnnouncement } from "@/services/announcements/announcements";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";

// Yeni elan: başlıq (bildirişin özü) + istəyə görə ətraflı mətn; göndərməzdən əvvəl təsdiq (hamıya gedir, geri alınmır)
export function AnnouncementForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  async function send() {
    setPending(true);
    const error = await createAnnouncement(title, body);
    setPending(false);
    setConfirm(false);
    if (error) return toast.error(error);
    toast.success("Elan hamıya göndərildi");
    setTitle("");
    setBody("");
    revalidate("announcements");
  }

  return (
    <Card as="form" className="space-y-3" onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (title.trim()) setConfirm(true); }}>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required
        placeholder="Məs.: Hər kəsin diqqətinə: sabah saat 9:00-da iclas" aria-label="Elanın başlığı" />
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} rows={3}
        placeholder="Ətraflı (istəyə görə): yer, gündəm..." aria-label="Elanın mətni" />
      <div className="flex items-center justify-between gap-3">
        <p className="muted text-xs">Bütün ustalara və rəhbərliyə push bildiriş kimi gedir.</p>
        <Button type="submit" size="sm" disabled={!title.trim()}><Send size={15} /> Göndər</Button>
      </div>
      <ConfirmModal open={confirm} title="Elan hamıya göndərilsin?" icon={Megaphone} confirmLabel="Bəli, göndər"
        message={<><b>{title.trim()}</b><br />Göndərilən bildirişi geri qaytarmaq olmur.</>}
        pending={pending} onConfirm={send} onCancel={() => setConfirm(false)} />
    </Card>
  );
}
