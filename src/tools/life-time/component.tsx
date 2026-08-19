import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { amountFieldError, dateFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import { formatNumber, formatPercent, parseAmount } from "@/utils/format";
import { calculateLifeTime, type LifeTimeResult } from "./calculate";
import { addToolHistory, setResult as persistResult } from "@/services/storage/storageService";

export function LifeTimeTool() {
  const { t, locale } = useI18n();
  const [values, setValues] = useState({ birthDate: "", lifeExpectancy: "80" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LifeTimeResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: keyof typeof values, v: string) =>
    setValues((s) => ({ ...s, [f]: v }));

  function handleCalculate() {
    const e: Record<string, string> = {};
    if (dateFieldError(values.birthDate)) e.birthDate = dateFieldError(values.birthDate)!;
    if (amountFieldError(values.lifeExpectancy, { mustBePositive: true })) e.lifeExpectancy = amountFieldError(values.lifeExpectancy, { mustBePositive: true })!;
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      return;
    }
    try {
      const r = calculateLifeTime({
        birthDate: values.birthDate,
        lifeExpectancy: parseAmount(values.lifeExpectancy)!,
      });
      setResult(r);
      setTopError(null);
      addToolHistory("life-time");
      persistResult("life-time:last", r);
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
        <p className="text-sm text-gray-500 mb-4">{t("tools.life-time.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField id="lt-birth" label={t("tools.life-time.inputs.birthDate")} value={values.birthDate} onChange={(v) => setField("birthDate", v)} type="date" error={errors.birthDate ? t(errors.birthDate) : undefined} />
          <InputField id="lt-expectancy" label={t("tools.life-time.inputs.lifeExpectancy")} value={values.lifeExpectancy} onChange={(v) => setField("lifeExpectancy", v)} suffix={t("common.years")} placeholder="80" error={errors.lifeExpectancy ? t(errors.lifeExpectancy) : undefined} />
        </div>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <ResultCard label={t("tools.life-time.results.ageYears")} value={`${formatNumber(result.ageYears, locale, 0)} ${t("common.years")}`} />
            <ResultCard label={t("tools.life-time.results.remainingYears")} value={`${formatNumber(result.remainingYears, locale, 0)} ${t("common.years")}`} />
            <ResultCard label={t("tools.life-time.results.remainingMonths")} value={`${formatNumber(result.remainingMonths, locale, 0)} ${t("common.months")}`} />
            <ResultCard label={t("tools.life-time.results.remainingWeeks")} value={`${formatNumber(result.remainingWeeks, locale, 0)} ${t("common.weeks")}`} />
            <ResultCard label={t("tools.life-time.results.lifeProgressPercent")} value={formatPercent(result.lifeProgressPercent, locale)} highlight />
          </div>
          <p className="text-xs text-gray-400">{t("tools.life-time.note")}</p>

          <DataCardGate
            cardInput={{
              tool: "life-time",
              title: t("tools.life-time.name"),
              summary: t("tools.life-time.summary", { progress: formatNumber(result.lifeProgressPercent, locale, 0) }),
              fields: [
                { label: t("tools.life-time.results.ageYears"), value: `${formatNumber(result.ageYears, locale, 0)} ${t("common.years")}` },
                { label: t("tools.life-time.results.remainingYears"), value: `${formatNumber(result.remainingYears, locale, 0)} ${t("common.years")}` },
                { label: t("tools.life-time.results.remainingWeeks"), value: `${formatNumber(result.remainingWeeks, locale, 0)} ${t("common.weeks")}` },
                { label: t("tools.life-time.results.lifeProgressPercent"), value: formatPercent(result.lifeProgressPercent, locale) },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
