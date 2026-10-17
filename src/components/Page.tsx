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

// Səhifə şablonu: başlıq menyu ilə birlikdə yuxarıda sabit zolaqdadır.
export function Page({ title, subtitle, back, actions, children }: Props) {
  return (
    <>
      <AppHeader>
        <div className="page-hero flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            {back && (
              <Link to={back.href} className="hero-back" title={back.label} aria-label={`${back.label} siyahısına qayıt`}>
                <ChevronLeft size={18} />
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="truncate">{title}</h1>
              {subtitle && <p className="truncate">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </div>
      </AppHeader>
      <main className="app-shell app-main">{children}</main>
    </>
  );
}
