import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-indigo text-white hover:opacity-90"
      : "border border-border bg-white text-slate hover:bg-indigo-light";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
