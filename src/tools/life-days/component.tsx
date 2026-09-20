import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { dateFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import { formatNumber } from "@/utils/format";
import { calculateLifeDays, type LifeDaysResult } from "./calculate";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LifeDaysTool() {
  const { t, locale } = useI18n();
  const [values, setValues] = useState({
    dateOfBirth: "",
    calculationDate: todayString,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LifeDaysResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: keyof typeof values, v: string) =>
    setValues((s) => ({ ...s, [f]: v }));

  function handleCalculate() {
    const e: Record<string, string> = {};
    if (dateFieldError(values.dateOfBirth)) e.dateOfBirth = dateFieldError(values.dateOfBirth)!;
    if (dateFieldError(values.calculationDate)) e.calculationDate = dateFieldError(values.calculationDate)!;
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      return;
    }
    try {
      const r = calculateLifeDays({
        dateOfBirth: values.dateOfBirth,
        calculationDate: values.calculationDate,
      });
      setResult(r);
      setTopError(null);
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
        <p className="text-sm text-gray-500 mb-4">{t("tools.life-days.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField id="ld-birth" label={t("tools.life-days.inputs.dateOfBirth")} value={values.dateOfBirth} onChange={(v) => setField("dateOfBirth", v)} type="date" error={errors.dateOfBirth ? t(errors.dateOfBirth) : undefined} />
          <InputField id="ld-calc" label={t("tools.life-days.inputs.calculationDate")} value={values.calculationDate} onChange={(v) => setField("calculationDate", v)} type="date" error={errors.calculationDate ? t(errors.calculationDate) : undefined} />
        </div>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ResultCard label={t("tools.life-days.results.daysLived")} value={`${formatNumber(result.daysLived, locale, 0)} ${t("common.days")}`} highlight />
            <ResultCard label={t("tools.life-days.results.weeksLived")} value={`${formatNumber(result.weeksLived, locale, 1)} ${t("common.weeks")}`} />
            <ResultCard label={t("tools.life-days.results.yearsLived")} value={`${formatNumber(result.yearsLived, locale, 1)} ${t("common.years")}`} />
            <ResultCard label={t("tools.life-days.results.nextMilestone")} value={`${formatNumber(result.nextMilestone, locale, 0)} ${t("common.days")}`} />
            <ResultCard label={t("tools.life-days.results.daysUntilMilestone")} value={`${formatNumber(result.daysUntilMilestone, locale, 0)} ${t("common.days")}`} />
          </div>
          <p className="text-xs text-gray-400">{t("tools.life-days.note")}</p>

          <DataCardGate
            cardInput={{
              tool: "life-days",
              title: t("tools.life-days.name"),
              summary: t("tools.life-days.summary", { days: formatNumber(result.daysLived, locale, 0) }),
              fields: [
                { label: t("tools.life-days.results.daysLived"), value: `${formatNumber(result.daysLived, locale, 0)} ${t("common.days")}` },
                { label: t("tools.life-days.results.weeksLived"), value: `${formatNumber(result.weeksLived, locale, 1)} ${t("common.weeks")}` },
                { label: t("tools.life-days.results.yearsLived"), value: `${formatNumber(result.yearsLived, locale, 1)} ${t("common.years")}` },
                { label: t("tools.life-days.results.nextMilestone"), value: `${formatNumber(result.nextMilestone, locale, 0)} ${t("common.days")}` },
                { label: t("tools.life-days.results.daysUntilMilestone"), value: `${formatNumber(result.daysUntilMilestone, locale, 0)} ${t("common.days")}` },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
