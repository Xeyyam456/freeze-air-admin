import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { AppHeader } from "./AppHeader";

type Props = {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  children: React.ReactNode;
};

// Səhifə şablonu: başlıq və əməliyyat düymələri yuxarıda sabit zolaqdadır (menyu solda, AppLayout-da).
export function Page({ title, subtitle, back, actions, children }: Props) {
  return (
    <>
      <AppHeader actions={actions}>
        <div className="page-hero flex min-w-0 items-center gap-4">
          {back && (
            <Link to={back.href} className="hero-back" title={back.label} aria-label={`${back.label} siyahısına qayıt`}>
              <ChevronLeft size={18} />
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="truncate max-sm:line-clamp-2 max-sm:whitespace-normal max-sm:!text-[15px] max-sm:leading-tight">{title}</h1>
            {subtitle && <p className="truncate">{subtitle}</p>}
          </div>
        </div>
      </AppHeader>
      <main className="app-shell app-main">{children}</main>
    </>
  );
}
