import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "light";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type LinkButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "light";
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

const variants = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]",
  secondary:
    "border border-[var(--line)] bg-transparent text-[var(--text)] hover:border-[var(--primary)]",
  light:
    "border border-white/20 bg-white text-[var(--primary-deep)] hover:bg-[var(--sub-mint)]",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-bold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
