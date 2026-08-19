import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { InputField } from "@/components/ui/InputField";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { amountFieldError, dateFieldError } from "@/utils/validateField";
import { ValidationError } from "@/utils/validate";
import { formatCurrency, formatDate, formatNumber, formatPercent, parseAmount } from "@/utils/format";
import { calculateGoalPlanner, type GoalPlannerResult } from "./calculate";
import { addToolHistory, getSettings, setResult as persistResult } from "@/services/storage/storageService";

const GOAL_TYPES = ["savings", "travel", "emergency", "education", "other"] as const;

export function GoalPlannerTool() {
  const { t, locale } = useI18n();
  const currency = getSettings().currency;
  const [goalType, setGoalType] = useState<(typeof GOAL_TYPES)[number]>("savings");
  const [values, setValues] = useState({
    goalAmount: "",
    currentAmount: "",
    monthlyContribution: "",
    annualRate: "5",
    targetDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GoalPlannerResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setField = (f: keyof typeof values, v: string) =>
    setValues((s) => ({ ...s, [f]: v }));

  function handleCalculate() {
    const e: Record<string, string> = {};
    if (amountFieldError(values.goalAmount, { mustBePositive: true })) e.goalAmount = amountFieldError(values.goalAmount, { mustBePositive: true })!;
    if (amountFieldError(values.currentAmount)) e.currentAmount = amountFieldError(values.currentAmount)!;
    if (amountFieldError(values.monthlyContribution)) e.monthlyContribution = amountFieldError(values.monthlyContribution)!;
    if (amountFieldError(values.annualRate)) e.annualRate = amountFieldError(values.annualRate)!;
    if (values.targetDate && dateFieldError(values.targetDate)) e.targetDate = dateFieldError(values.targetDate)!;
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      return;
    }
    try {
      const r = calculateGoalPlanner({
        goalAmount: parseAmount(values.goalAmount)!,
        currentAmount: parseAmount(values.currentAmount)!,
        monthlyContribution: parseAmount(values.monthlyContribution)!,
        annualRate: parseAmount(values.annualRate)!,
        targetDate: values.targetDate || null,
      });
      setResult(r);
      setTopError(null);
      addToolHistory("goal-planner");
      persistResult("goal-planner:last", { ...r, goalType });
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
        <p className="text-sm text-gray-500 mb-4">{t("tools.goal-planner.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">{t("tools.goal-planner.inputs.goalType")}</label>
            <select
              aria-label={t("tools.goal-planner.inputs.goalType")}
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as (typeof GOAL_TYPES)[number])}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            >
              {GOAL_TYPES.map((g) => (
                <option key={g} value={g}>{t(`tools.goal-planner.types.${g}`)}</option>
              ))}
            </select>
          </div>
          <InputField id="gp-goal" label={t("tools.goal-planner.inputs.goalAmount")} value={values.goalAmount} onChange={(v) => setField("goalAmount", v)} prefix={currency} placeholder="100000" error={errors.goalAmount ? t(errors.goalAmount) : undefined} />
          <InputField id="gp-current" label={t("tools.goal-planner.inputs.currentAmount")} value={values.currentAmount} onChange={(v) => setField("currentAmount", v)} prefix={currency} placeholder="20000" error={errors.currentAmount ? t(errors.currentAmount) : undefined} />
          <InputField id="gp-monthly" label={t("tools.goal-planner.inputs.monthlyContribution")} value={values.monthlyContribution} onChange={(v) => setField("monthlyContribution", v)} prefix={currency} placeholder="500" error={errors.monthlyContribution ? t(errors.monthlyContribution) : undefined} />
          <InputField id="gp-rate" label={t("tools.goal-planner.inputs.annualRate")} value={values.annualRate} onChange={(v) => setField("annualRate", v)} suffix={t("common.percent")} placeholder="5" error={errors.annualRate ? t(errors.annualRate) : undefined} />
          <InputField id="gp-target" label={t("tools.goal-planner.inputs.targetDate")} value={values.targetDate} onChange={(v) => setField("targetDate", v)} type="date" optional error={errors.targetDate ? t(errors.targetDate) : undefined} />
        </div>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          {!result.reachable && (
            <p className="text-sm text-red-500">{t("errors.unreachable")}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard label={t("tools.goal-planner.results.progressPercent")} value={formatPercent(result.progressPercent, locale)} highlight />
            <ResultCard label={t("tools.goal-planner.results.remainingAmount")} value={formatCurrency(result.remainingAmount, locale, currency)} />
            <ResultCard
              label={t("tools.goal-planner.results.estimatedCompletion")}
              value={result.estimatedCompletionDate ? formatDate(result.estimatedCompletionDate, locale) : "—"}
            />
            <ResultCard
              label={t("tools.goal-planner.results.monthlyNeeded")}
              value={result.monthlyNeeded != null ? formatCurrency(result.monthlyNeeded, locale, currency) : "—"}
            />
          </div>

          <DataCardGate
            cardInput={{
              tool: "goal-planner",
              title: t("tools.goal-planner.name"),
              summary: t("tools.goal-planner.summary", { progress: formatNumber(result.progressPercent, locale, 0) }),
              fields: [
                { label: t("tools.goal-planner.inputs.goalType"), value: t(`tools.goal-planner.types.${goalType}`) },
                { label: t("tools.goal-planner.results.progressPercent"), value: formatPercent(result.progressPercent, locale) },
                { label: t("tools.goal-planner.results.remainingAmount"), value: formatCurrency(result.remainingAmount, locale, currency) },
                { label: t("tools.goal-planner.results.estimatedCompletion"), value: result.estimatedCompletionDate ? formatDate(result.estimatedCompletionDate, locale) : "—" },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
