import type { SelectHTMLAttributes } from "react";

type SelectProps = {
  label: string;
  options: string[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  label,
  id,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-bold text-[var(--text)]">
        {label}
      </span>
      <span className="relative block">
        <select
          className={`min-h-12 w-full appearance-none rounded-md border border-[var(--line)] bg-white py-0 pr-12 pl-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)] ${className}`}
          id={id}
          {...props}
        >
          <option value="">선택해 주세요</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[var(--sub-text)]"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
    </label>
  );
}
