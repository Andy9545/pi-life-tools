import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { amountFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import { formatCurrency, formatNumber, parseAmount } from "@/utils/format";
import { calculateDebtPayoff, type DebtPayoffResult } from "./calculate";
import { addToolHistory, getSettings, setResult as persistResult } from "@/services/storage/storageService";

export function DebtPayoffTool() {
  const { t, locale } = useI18n();
  const currency = getSettings().currency;
  const [values, setValues] = useState({ debtAmount: "", annualRate: "18", monthlyPayment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DebtPayoffResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: keyof typeof values, v: string) => setValues((s) => ({ ...s, [f]: v }));

  function handleCalculate() {
    const e: Record<string, string> = {};
    if (amountFieldError(values.debtAmount, { mustBePositive: true })) e.debtAmount = amountFieldError(values.debtAmount, { mustBePositive: true })!;
    if (amountFieldError(values.annualRate)) e.annualRate = amountFieldError(values.annualRate)!;
    if (amountFieldError(values.monthlyPayment, { mustBePositive: true })) e.monthlyPayment = amountFieldError(values.monthlyPayment, { mustBePositive: true })!;
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      return;
    }
    try {
      const r = calculateDebtPayoff({
        debtAmount: parseAmount(values.debtAmount)!,
        annualRate: parseAmount(values.annualRate)!,
        monthlyPayment: parseAmount(values.monthlyPayment)!,
      });
      setResult(r);
      setTopError(null);
      addToolHistory("debt-payoff");
      persistResult("debt-payoff:last", r);
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
        <p className="text-sm text-gray-500 mb-4">{t("tools.debt-payoff.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField id="dp-debt" label={t("tools.debt-payoff.inputs.debtAmount")} value={values.debtAmount} onChange={(v) => setField("debtAmount", v)} prefix={currency} placeholder="10000" error={errors.debtAmount ? t(errors.debtAmount) : undefined} />
          <InputField id="dp-rate" label={t("tools.debt-payoff.inputs.annualRate")} value={values.annualRate} onChange={(v) => setField("annualRate", v)} suffix={t("common.percent")} placeholder="18" error={errors.annualRate ? t(errors.annualRate) : undefined} />
          <InputField id="dp-payment" label={t("tools.debt-payoff.inputs.monthlyPayment")} value={values.monthlyPayment} onChange={(v) => setField("monthlyPayment", v)} prefix={currency} placeholder="500" error={errors.monthlyPayment ? t(errors.monthlyPayment) : undefined} />
        </div>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          {result.insufficientPayment ? (
            <p className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {t("errors.insufficientPayment")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ResultCard label={t("tools.debt-payoff.results.payoffMonths")} value={`${formatNumber(result.payoffMonths!, locale, 0)} ${t("common.months")}`} highlight />
                <ResultCard label={t("tools.debt-payoff.results.totalInterest")} value={formatCurrency(result.totalInterest, locale, currency)} />
                <ResultCard label={t("tools.debt-payoff.results.totalPayment")} value={formatCurrency(result.totalPayment, locale, currency)} />
              </div>
              <DataCardGate
                cardInput={{
                  tool: "debt-payoff",
                  title: t("tools.debt-payoff.name"),
                  summary: t("tools.debt-payoff.summary", { months: formatNumber(result.payoffMonths!, locale, 0) }),
                  fields: [
                    { label: t("tools.debt-payoff.results.payoffMonths"), value: `${formatNumber(result.payoffMonths!, locale, 0)} ${t("common.months")}` },
                    { label: t("tools.debt-payoff.results.totalInterest"), value: formatCurrency(result.totalInterest, locale, currency) },
                    { label: t("tools.debt-payoff.results.totalPayment"), value: formatCurrency(result.totalPayment, locale, currency) },
                  ],
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
