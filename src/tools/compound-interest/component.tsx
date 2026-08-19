import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { amountFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import { formatCurrency, formatNumber, parseAmount } from "@/utils/format";
import {
  calculateCompoundInterest,
  type CompoundInterestResult,
} from "./calculate";
import { addToolHistory, getSettings, setResult as persistResult } from "@/services/storage/storageService";

const FIELDS = ["principal", "monthlyContribution", "annualRate", "years"] as const;
type Field = (typeof FIELDS)[number];

export function CompoundInterestTool() {
  const { t, locale } = useI18n();
  const currency = getSettings().currency;
  const [values, setValues] = useState<Record<Field, string>>({
    principal: "",
    monthlyContribution: "",
    annualRate: "7",
    years: "10",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [result, setResult] = useState<CompoundInterestResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: Field, v: string) => setValues((s) => ({ ...s, [f]: v }));

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
      const r = calculateCompoundInterest({
        principal: parseAmount(values.principal)!,
        monthlyContribution: parseAmount(values.monthlyContribution)!,
        annualRate: parseAmount(values.annualRate)!,
        years: parseAmount(values.years)!,
      });
      setResult(r);
      setTopError(null);
      addToolHistory("compound-interest");
      persistResult("compound-interest:last", r);
    } catch (err) {
      if (err instanceof ValidationError) {
        setResult(null);
        setTopError(err.key);
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <p className="text-sm text-gray-500 mb-4">
          {t("tools.compound-interest.intro")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField id="ci-principal" label={t("tools.compound-interest.inputs.principal")} value={values.principal} onChange={(v) => setField("principal", v)} prefix={currency} placeholder="10000" error={errors.principal ? t(errors.principal!) : undefined} />
          <InputField id="ci-monthly" label={t("tools.compound-interest.inputs.monthlyContribution")} value={values.monthlyContribution} onChange={(v) => setField("monthlyContribution", v)} prefix={currency} placeholder="200" error={errors.monthlyContribution ? t(errors.monthlyContribution!) : undefined} />
          <InputField id="ci-rate" label={t("tools.compound-interest.inputs.annualRate")} value={values.annualRate} onChange={(v) => setField("annualRate", v)} suffix={t("common.percent")} placeholder="7" error={errors.annualRate ? t(errors.annualRate!) : undefined} />
          <InputField id="ci-years" label={t("tools.compound-interest.inputs.years")} value={values.years} onChange={(v) => setField("years", v)} suffix={t("common.years")} placeholder="10" error={errors.years ? t(errors.years!) : undefined} />
        </div>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard label={t("tools.compound-interest.results.finalAmount")} value={formatCurrency(result.finalAmount, locale, currency)} highlight />
            <ResultCard label={t("tools.compound-interest.results.totalPrincipal")} value={formatCurrency(result.totalPrincipal, locale, currency)} />
            <ResultCard label={t("tools.compound-interest.results.totalInterest")} value={formatCurrency(result.totalInterest, locale, currency)} />
          </div>
          <p className="text-xs text-gray-400">{t("tools.compound-interest.note")}</p>

          <div className="max-h-64 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">{t("tools.compound-interest.table.year")}</th>
                  <th className="text-right px-3 py-2 font-medium">{t("tools.compound-interest.table.balance")}</th>
                  <th className="text-right px-3 py-2 font-medium">{t("tools.compound-interest.table.principal")}</th>
                </tr>
              </thead>
              <tbody>
                {result.annualGrowth.map((row) => (
                  <tr key={row.year} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-600">{formatNumber(row.year, locale, 0)}</td>
                    <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(row.balance, locale, currency)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{formatCurrency(row.principal, locale, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DataCardGate
            cardInput={{
              tool: "compound-interest",
              title: t("tools.compound-interest.name"),
              summary: t("tools.compound-interest.summary", {
                amount: formatCurrency(result.finalAmount, locale, currency),
                years: formatNumber(result.annualGrowth[result.annualGrowth.length - 1]?.year ?? 0, locale, 0),
              }),
              fields: [
                { label: t("tools.compound-interest.results.finalAmount"), value: formatCurrency(result.finalAmount, locale, currency) },
                { label: t("tools.compound-interest.results.totalPrincipal"), value: formatCurrency(result.totalPrincipal, locale, currency) },
                { label: t("tools.compound-interest.results.totalInterest"), value: formatCurrency(result.totalInterest, locale, currency) },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
