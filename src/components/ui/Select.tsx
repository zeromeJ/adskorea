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
      <select
        className={`min-h-12 w-full rounded-md border border-[var(--line)] bg-white px-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)] ${className}`}
        id={id}
        {...props}
      >
        <option value="">Select option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
