import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { amountFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import { formatCurrency, formatPercent, parseAmount } from "@/utils/format";
import { calculateMortgage, type MortgageResult } from "./calculate";
import { addToolHistory, getSettings, setResult as persistResult } from "@/services/storage/storageService";

type Field = "homePrice" | "downPayment" | "annualRate" | "years";

export function MortgageTool() {
  const { t, locale } = useI18n();
  const currency = getSettings().currency;
  const [values, setValues] = useState<Record<Field, string>>({
    homePrice: "",
    downPayment: "",
    annualRate: "6",
    years: "30",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: Field, v: string) => setValues((s) => ({ ...s, [f]: v }));

  function handleCalculate() {
    const e: Partial<Record<Field, string>> = {};
    (["homePrice", "downPayment", "annualRate"] as Field[]).forEach((f) => {
      const err = amountFieldError(values[f]);
      if (err) e[f] = err;
    });
    if (amountFieldError(values.years, { mustBePositive: true })) e.years = amountFieldError(values.years, { mustBePositive: true })!;
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      return;
    }
    try {
      const r = calculateMortgage({
        homePrice: parseAmount(values.homePrice)!,
        downPayment: parseAmount(values.downPayment)!,
        annualRate: parseAmount(values.annualRate)!,
        years: parseAmount(values.years)!,
      });
      setResult(r);
      setTopError(null);
      addToolHistory("mortgage");
      persistResult("mortgage:last", r);
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
        <p className="text-sm text-gray-500 mb-4">{t("tools.mortgage.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField id="mg-price" label={t("tools.mortgage.inputs.homePrice")} value={values.homePrice} onChange={(v) => setField("homePrice", v)} prefix={currency} placeholder="300000" error={errors.homePrice ? t(errors.homePrice!) : undefined} />
          <InputField id="mg-down" label={t("tools.mortgage.inputs.downPayment")} value={values.downPayment} onChange={(v) => setField("downPayment", v)} prefix={currency} placeholder="60000" error={errors.downPayment ? t(errors.downPayment!) : undefined} />
          <InputField id="mg-rate" label={t("tools.mortgage.inputs.annualRate")} value={values.annualRate} onChange={(v) => setField("annualRate", v)} suffix={t("common.percent")} placeholder="6" error={errors.annualRate ? t(errors.annualRate!) : undefined} />
          <InputField id="mg-years" label={t("tools.mortgage.inputs.years")} value={values.years} onChange={(v) => setField("years", v)} suffix={t("common.years")} placeholder="30" error={errors.years ? t(errors.years!) : undefined} />
        </div>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <ResultCard label={t("tools.mortgage.results.loanAmount")} value={formatCurrency(result.loanAmount, locale, currency)} />
            <ResultCard label={t("tools.mortgage.results.monthlyPayment")} value={formatCurrency(result.monthlyPayment, locale, currency)} highlight />
            <ResultCard label={t("tools.mortgage.results.totalPayment")} value={formatCurrency(result.totalPayment, locale, currency)} />
            <ResultCard label={t("tools.mortgage.results.totalInterest")} value={formatCurrency(result.totalInterest, locale, currency)} />
            <ResultCard label={t("tools.mortgage.results.interestRatio")} value={formatPercent(result.interestRatio, locale)} />
          </div>

          <DataCardGate
            cardInput={{
              tool: "mortgage",
              title: t("tools.mortgage.name"),
              summary: t("tools.mortgage.summary", { amount: formatCurrency(result.monthlyPayment, locale, currency) }),
              fields: [
                { label: t("tools.mortgage.results.loanAmount"), value: formatCurrency(result.loanAmount, locale, currency) },
                { label: t("tools.mortgage.results.monthlyPayment"), value: formatCurrency(result.monthlyPayment, locale, currency) },
                { label: t("tools.mortgage.results.totalInterest"), value: formatCurrency(result.totalInterest, locale, currency) },
                { label: t("tools.mortgage.results.interestRatio"), value: formatPercent(result.interestRatio, locale) },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
