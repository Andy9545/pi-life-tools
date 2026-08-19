import clsx from "clsx";

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  hint?: string;
}

export function ResultCard({ label, value, highlight, hint }: ResultCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-4 flex flex-col gap-1",
        highlight
          ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
          : "border-gray-200 bg-white",
      )}
    >
      <span className="text-xs text-gray-500">{label}</span>
      <span
        className={clsx(
          "text-xl font-semibold break-words",
          highlight ? "text-[var(--color-brand-dark)]" : "text-gray-900",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}
