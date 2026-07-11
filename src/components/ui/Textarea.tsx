import type { TextareaHTMLAttributes } from "react";

type TextareaProps = {
  label: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({
  label,
  id,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-bold text-[var(--text)]">
        {label}
      </span>
      <textarea
        className={`min-h-36 w-full resize-y rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#95a29a] focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(46,92,69,0.12)] ${className}`}
        id={id}
        {...props}
      />
    </label>
  );
}
