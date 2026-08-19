import clsx from "clsx";

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  type?: "text" | "number" | "date";
  inputMode?: "numeric" | "decimal" | "text";
  error?: string | null;
  optional?: boolean;
}

export function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  type = "text",
  inputMode = "decimal",
  error,
  optional,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-gray-400">·</span>
        )}
      </label>
      <div
        className={clsx(
          "flex items-stretch rounded-xl border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-brand)] focus-within:border-[var(--color-brand)] transition",
          error ? "border-red-400" : "border-gray-200",
        )}
      >
        {prefix && (
          <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 min-w-0 px-3 py-3 text-base text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
        />
        {suffix && (
          <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border-l border-gray-200">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
