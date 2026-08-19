import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { amountFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import { formatCurrency, formatNumber, parseAmount } from "@/utils/format";
import { calculateTimeValue, type TimeValueResult } from "./calculate";
import { addToolHistory, getSettings, setResult as persistResult } from "@/services/storage/storageService";

export function TimeValueTool() {
  const { t, locale } = useI18n();
  const currency = getSettings().currency;
  const [values, setValues] = useState({
    annualIncome: "",
    weeklyHours: "40",
    weeksPerYear: "52",
    itemPrice: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TimeValueResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: keyof typeof values, v: string) => setValues((s) => ({ ...s, [f]: v }));

  function handleCalculate() {
    const e: Record<string, string> = {};
    if (amountFieldError(values.annualIncome)) e.annualIncome = amountFieldError(values.annualIncome)!;
    if (amountFieldError(values.weeklyHours, { mustBePositive: true })) e.weeklyHours = amountFieldError(values.weeklyHours, { mustBePositive: true })!;
    if (amountFieldError(values.weeksPerYear, { mustBePositive: true })) e.weeksPerYear = amountFieldError(values.weeksPerYear, { mustBePositive: true })!;
    if (values.itemPrice && amountFieldError(values.itemPrice)) e.itemPrice = amountFieldError(values.itemPrice)!;
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      return;
    }
    try {
      const r = calculateTimeValue({
        annualIncome: parseAmount(values.annualIncome)!,
        weeklyHours: parseAmount(values.weeklyHours)!,
        weeksPerYear: parseAmount(values.weeksPerYear)!,
        itemPrice: values.itemPrice ? parseAmount(values.itemPrice) : null,
      });
      setResult(r);
      setTopError(null);
      addToolHistory("time-value");
      persistResult("time-value:last", r);
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
        <p className="text-sm text-gray-500 mb-4">{t("tools.time-value.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField id="tv-income" label={t("tools.time-value.inputs.annualIncome")} value={values.annualIncome} onChange={(v) => setField("annualIncome", v)} prefix={currency} placeholder="60000" error={errors.annualIncome ? t(errors.annualIncome) : undefined} />
          <InputField id="tv-hours" label={t("tools.time-value.inputs.weeklyHours")} value={values.weeklyHours} onChange={(v) => setField("weeklyHours", v)} placeholder="40" error={errors.weeklyHours ? t(errors.weeklyHours) : undefined} />
          <InputField id="tv-weeks" label={t("tools.time-value.inputs.weeksPerYear")} value={values.weeksPerYear} onChange={(v) => setField("weeksPerYear", v)} placeholder="52" error={errors.weeksPerYear ? t(errors.weeksPerYear) : undefined} />
          <InputField id="tv-item" label={t("tools.time-value.inputs.itemPrice")} value={values.itemPrice} onChange={(v) => setField("itemPrice", v)} prefix={currency} placeholder="500" optional error={errors.itemPrice ? t(errors.itemPrice) : undefined} />
        </div>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard label={t("tools.time-value.results.hourlyRate")} value={formatCurrency(result.hourlyRate, locale, currency)} highlight />
            <ResultCard label={t("tools.time-value.results.minuteRate")} value={formatCurrency(result.minuteRate, locale, currency)} />
            <ResultCard
              label={t("tools.time-value.results.hoursForItem")}
              value={result.hoursForItem != null ? `${formatNumber(result.hoursForItem, locale, 1)} ${t("common.hours")}` : "—"}
            />
          </div>
          {result.hoursForItem != null && values.itemPrice && (
            <p className="text-sm text-gray-700">
              {t("tools.time-value.itemResult", {
                price: formatCurrency(parseAmount(values.itemPrice)!, locale, currency),
                hours: formatNumber(result.hoursForItem, locale, 1),
              })}
            </p>
          )}

          <DataCardGate
            cardInput={{
              tool: "time-value",
              title: t("tools.time-value.name"),
              summary: t("tools.time-value.summary", { rate: formatCurrency(result.hourlyRate, locale, currency) }),
              fields: [
                { label: t("tools.time-value.results.hourlyRate"), value: formatCurrency(result.hourlyRate, locale, currency) },
                { label: t("tools.time-value.results.minuteRate"), value: formatCurrency(result.minuteRate, locale, currency) },
                { label: t("tools.time-value.results.hoursForItem"), value: result.hoursForItem != null ? `${formatNumber(result.hoursForItem, locale, 1)} ${t("common.hours")}` : "—" },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
