import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { amountFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import {
  formatNumber,
  formatPercent,
  parseAmount,
} from "@/utils/format";
import {
  calculateFinancialHealth,
  type FinancialHealthResult,
} from "./calculate";
import {
  addToolHistory,
  getSettings,
  setResult as persistResult,
  setDashboardLifeScore,
} from "@/services/storage/storageService";

const FIELDS = [
  "monthlyIncome",
  "monthlyExpenses",
  "monthlySavings",
  "debt",
  "emergencyFund",
] as const;
type Field = (typeof FIELDS)[number];

export function FinancialHealthTool() {
  const { t, locale } = useI18n();
  const currency = getSettings().currency;
  const [values, setValues] = useState<Record<Field, string>>({
    monthlyIncome: "",
    monthlyExpenses: "",
    monthlySavings: "",
    debt: "",
    emergencyFund: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [result, setResult] = useState<FinancialHealthResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: Field, v: string) =>
    setValues((s) => ({ ...s, [f]: v }));

  function handleCalculate() {
    const e: Partial<Record<Field, string>> = {};
    for (const f of FIELDS) {
      const err = amountFieldError(values[f]);
      if (err) e[f] = err;
    }
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      return;
    }
    try {
      const r = calculateFinancialHealth({
        monthlyIncome: parseAmount(values.monthlyIncome)!,
        monthlyExpenses: parseAmount(values.monthlyExpenses)!,
        monthlySavings: parseAmount(values.monthlySavings)!,
        debt: parseAmount(values.debt)!,
        emergencyFund: parseAmount(values.emergencyFund)!,
      });
      setResult(r);
      setTopError(null);
      addToolHistory("financial-health");
      persistResult("financial-health:last", r);
      setDashboardLifeScore(r.financialHealthScore);
    } catch (err) {
      if (err instanceof ValidationError) {
        setResult(null);
        setTopError(err.key);
      }
    }
  }

  const recs: { show: boolean; key: string }[] = result
    ? [
        { show: result.flags.lowSavings, key: "tools.financial-health.rec.savings" },
        { show: result.flags.lowEmergency, key: "tools.financial-health.rec.emergency" },
        { show: result.flags.highDebt, key: "tools.financial-health.rec.debt" },
        { show: result.flags.highExpenses, key: "tools.financial-health.rec.expenses" },
      ]
    : [];
  const shownRecs = result?.flags.allGood
    ? [{ key: "tools.financial-health.rec.good" }]
    : recs.filter((r) => r.show);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <p className="text-sm text-gray-500 mb-4">
          {t("tools.financial-health.intro")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <InputField
              key={f}
              id={`fh-${f}`}
              label={t(`tools.financial-health.inputs.${f}`)}
              value={values[f]}
              onChange={(v) => setField(f, v)}
              prefix={currency}
              placeholder="0"
              error={errors[f] ? t(errors[f]!) : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleCalculate}
          className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition"
        >
          {t("common.calculate")}
        </button>
        {topError && (
          <p className="mt-3 text-sm text-red-500">{t(topError)}</p>
        )}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard
              label={t("tools.financial-health.results.savingsRate")}
              value={formatPercent(result.savingsRate, locale)}
            />
            <ResultCard
              label={t("tools.financial-health.results.incomeExpenseRatio")}
              value={formatPercent(result.incomeExpenseRatio, locale)}
            />
            <ResultCard
              label={t("tools.financial-health.results.emergencyFundMonths")}
              value={`${formatNumber(result.emergencyFundMonths, locale, 1)} ${t("common.months")}`}
            />
            <ResultCard
              label={t("tools.financial-health.results.financialHealthScore")}
              value={`${formatNumber(result.financialHealthScore, locale, 0)}/100`}
              highlight
            />
          </div>

          <ul className="space-y-1.5 text-sm text-gray-700">
            {shownRecs.map((r) => (
              <li key={r.key} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{t(r.key)}</span>
              </li>
            ))}
          </ul>

          <DataCardGate
            cardInput={{
              tool: "financial-health",
              title: t("tools.financial-health.name"),
              summary: t("tools.financial-health.summary", {
                score: formatNumber(result.financialHealthScore, locale, 0),
              }),
              fields: [
                {
                  label: t("tools.financial-health.results.savingsRate"),
                  value: formatPercent(result.savingsRate, locale),
                },
                {
                  label: t("tools.financial-health.results.emergencyFundMonths"),
                  value: `${formatNumber(result.emergencyFundMonths, locale, 1)} ${t("common.months")}`,
                },
                {
                  label: t("tools.financial-health.results.financialHealthScore"),
                  value: `${formatNumber(result.financialHealthScore, locale, 0)}/100`,
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
