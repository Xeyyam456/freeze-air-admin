import { KeyRound } from "lucide-react";

// Giriş hesabı qutusunun çərçivəsi və başlığı (sağda istəyə görə nişan)
export function AccountBox({ right, children }: { right?: React.ReactNode; children: React.ReactNode }) {
  const title = <p className="flex items-center gap-1.5 text-xs font-semibold"><KeyRound size={13} className="text-primary" /> Giriş hesabı</p>;
  return (
    <div className="rounded-xl border border-line px-3 py-2.5">
      {right ? <div className="flex items-center justify-between gap-2">{title}{right}</div> : title}
      {children}
    </div>
  );
}
