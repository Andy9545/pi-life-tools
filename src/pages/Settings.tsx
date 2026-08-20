import { useEffect, useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
  getSettings,
  updateSettings,
  resetState,
} from "@/services/storage/storageService";
import {
  isPiAvailable,
  isPiInitialized,
  getPiUser,
  authenticatePi,
  getInitError,
  subscribeAuth,
} from "@/services/pi/piService";
import type { PiUser } from "@/services/pi/types";

const CURRENCIES = ["USD", "EUR", "JPY", "KRW", "TWD", "CNY", "GBP", "CAD", "AUD"];

export function Settings() {
  const { t, locale } = useI18n();
  void locale;
  const [settings, setSettings] = useState(getSettings());
  const [piUser, setPiUser] = useState<PiUser | null>(getPiUser());
  const [resetToast, setResetToast] = useState(false);

  // Reflect auto-auth (on load) as well as manual sign-in in real time.
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setPiUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t("settings.title")}
      </h1>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">{t("settings.language")}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-3">
          {t("settings.languageHint")}
        </p>
        <LanguageSwitcher />
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">{t("settings.currency")}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-3">
          {t("settings.currencyHint")}
        </p>
        <select
          aria-label={t("settings.currency")}
          value={settings.currency}
          onChange={(e) => {
            const currency = e.target.value;
            updateSettings({ currency });
            setSettings(getSettings());
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">{t("settings.piStatus")}</h2>
        <p className="text-sm mt-2">
          {isPiAvailable() && isPiInitialized() && !getInitError() ? (
            <span className="text-green-600">{t("settings.piAvailable")}</span>
          ) : (
            <span className="text-gray-500">{t("settings.piUnavailable")}</span>
          )}
        </p>
        {piUser && (
          <p className="text-sm text-gray-600 mt-1">
            {t("settings.piUser")}: <span className="font-medium">{piUser.username}</span>
          </p>
        )}
        {isPiAvailable() && !piUser && (
          <button
            type="button"
            onClick={async () => setPiUser(await authenticatePi(["username"]))}
            className="mt-3 px-4 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium active:scale-95 transition"
          >
            {t("settings.piSignIn")}
          </button>
        )}
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <h2 className="font-semibold text-red-700">{t("settings.resetData")}</h2>
        <p className="text-sm text-red-600/80 mt-1 mb-3">
          {t("settings.resetDataHint")}
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm(t("settings.resetConfirm"))) {
              resetState();
              setSettings(getSettings());
              setResetToast(true);
              setTimeout(() => setResetToast(false), 2000);
            }
          }}
          className="px-4 py-2.5 rounded-lg border border-red-300 bg-white text-red-700 text-sm font-medium active:scale-95 transition"
        >
          {t("settings.resetData")}
        </button>
        {resetToast && (
          <p className="mt-3 text-sm text-green-600">{t("settings.resetDone")}</p>
        )}
      </section>
    </div>
  );
}
