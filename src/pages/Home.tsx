import { Link } from "react-router-dom";
import { useI18n } from "@/services/i18n/context";
import {
  TOOL_GROUPS,
  toolIconKey,
  toolNameKey,
  toolTaglineKey,
  type ToolSlug,
} from "@/tools/registry";
import {
  getDashboard,
  getDataCards,
  getResult,
  getSettings,
} from "@/services/storage/storageService";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/format";

interface Widget {
  slug: ToolSlug;
  value: string;
}

export function Home() {
  const { t, locale } = useI18n();
  const currency = getSettings().currency;
  const dashboard = getDashboard();
  const cards = getDataCards().slice(0, 4);

  // Dashboard only surfaces data the user has already produced (Spec §6).
  const widgets: Widget[] = [];
  const fh = getResult<{ financialHealthScore: number }>("financial-health:last");
  if (fh) widgets.push({ slug: "financial-health", value: `${formatNumber(fh.financialHealthScore, locale, 0)}/100` });
  const gp = getResult<{ progressPercent: number }>("goal-planner:last");
  if (gp) widgets.push({ slug: "goal-planner", value: formatPercent(gp.progressPercent, locale) });
  const lt = getResult<{ lifeProgressPercent: number }>("life-time:last");
  if (lt) widgets.push({ slug: "life-time", value: formatPercent(lt.lifeProgressPercent, locale) });
  const ci = getResult<{ finalAmount: number }>("compound-interest:last");
  if (ci) widgets.push({ slug: "compound-interest", value: formatCurrency(ci.finalAmount, locale, currency) });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 text-gray-600">{t("dashboard.subtitle")}</p>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-500">
          {t("dashboard.lifeScore")}
        </h2>
        {dashboard.lifeScore != null ? (
          <p className="mt-2 text-4xl font-bold text-[var(--color-brand-dark)]">
            {formatPercent(dashboard.lifeScore, locale, 0)}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            {t("dashboard.lifeScoreEmpty")}
          </p>
        )}
      </section>

      {widgets.length > 0 && (
        <section className="mb-6 grid grid-cols-2 gap-3">
          {widgets.map((w) => (
            <Link
              key={w.slug}
              to={`/tools/${w.slug}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 active:scale-[0.98] hover:border-[var(--color-brand)] transition"
            >
              <span className="text-2xl" aria-hidden>
                {t(toolIconKey(w.slug))}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-gray-500 truncate">
                  {t(toolNameKey(w.slug))}
                </span>
                <span className="block font-semibold text-gray-900 truncate">
                  {w.value}
                </span>
              </span>
            </Link>
          ))}
        </section>
      )}

      {TOOL_GROUPS.map((group, gi) => (
        <section key={gi} className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.slugs.map((slug: ToolSlug) => (
              <Link
                key={slug}
                to={`/tools/${slug}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 active:scale-[0.98] hover:border-[var(--color-brand)] transition"
              >
                <span className="text-2xl" aria-hidden>
                  {t(toolIconKey(slug))}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-gray-900 truncate">
                    {t(toolNameKey(slug))}
                  </span>
                  <span className="block text-xs text-gray-500 truncate">
                    {t(toolTaglineKey(slug))}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mb-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">
          {t("dashboard.recentCards")}
        </h2>
        {cards.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
            {t("dashboard.recentCardsEmpty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {cards.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="font-medium text-gray-900">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
