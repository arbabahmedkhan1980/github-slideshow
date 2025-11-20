import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import clsx from "clsx";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({
  className,
  variant = "primary",
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const variants: Record<typeof variant, string> = {
    primary: "bg-brand text-white hover:bg-brand-dark focus-visible:outline-brand-dark",
    secondary:
      "bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:outline-brand",
    ghost: "bg-transparent text-brand hover:bg-brand-light/40 focus-visible:outline-brand"
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    />
  );
};
