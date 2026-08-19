import { useI18n } from "@/services/i18n/context";
import { locales, localeMeta, type Locale } from "@/services/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeMeta[l].name}
          </option>
        ))}
      </select>
    </label>
  );
}
