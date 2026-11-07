import { MessageSquareText } from "lucide-react";

// Şərh ikonu (tək yer): plitə + MessageSquareText. active — gradient (şərh var / pəncərə başlığı), yoxsa boz plita; hover-i üst düymə ("group") idarə edir
export function CommentIcon({ active = true, className = "" }: { active?: boolean; className?: string }) {
  return (
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition duration-300 ${active ? "bg-gradient-to-br from-primary to-cyan-400 text-white shadow-[0_6px_16px_-6px_var(--color-primary)]" : "bg-surface-2 text-muted group-hover:text-primary"} ${className}`}>
      <MessageSquareText size={17} strokeWidth={2.2} />
    </span>
  );
}
