import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useI18n } from "@/services/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Header() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/settings", label: t("nav.settings") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white text-sm font-bold">
            Pi
          </span>
          <span className="truncate font-semibold text-gray-900">
            {t("site.name")}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition",
                  active
                    ? "text-[var(--color-brand-dark)] bg-[var(--color-brand)]/10"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
