import { Link } from "react-router-dom";
import { useI18n } from "@/services/i18n/context";

export function NotFound() {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl font-bold text-[var(--color-brand)] mb-4">404</p>
      <p className="text-gray-600 mb-6">{t("empty.default")}</p>
      <Link
        to="/"
        className="inline-block px-4 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium"
      >
        {t("common.backHome")}
      </Link>
    </div>
  );
}
