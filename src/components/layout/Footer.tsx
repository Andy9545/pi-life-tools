import { useI18n } from "@/services/i18n/context";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <p className="text-xs text-gray-500">{t("common.disclaimer")}</p>
        <p className="mt-1 text-xs text-gray-400">
          {t("site.name")} · {t("dataCard.brand")}
        </p>
      </div>
    </footer>
  );
}
