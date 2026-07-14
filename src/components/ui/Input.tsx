import type { InputHTMLAttributes } from "react";

type InputProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <label className="flex min-w-0 flex-col" htmlFor={id}>
      <span className="mb-2 flex min-h-6 items-center text-sm font-bold text-[var(--text)]">
        {label}
      </span>
      <input
        className={`min-h-12 min-w-0 max-w-full rounded-md border border-[var(--line)] bg-white px-4 text-base outline-none transition placeholder:text-[#95a29a] focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)] ${className}`}
        id={id}
        {...props}
      />
    </label>
  );
}
