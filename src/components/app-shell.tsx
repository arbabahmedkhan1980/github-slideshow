import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export const AppShell = ({ title, actions, children }: AppShellProps) => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <header className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-xs font-semibold uppercase tracking-wide text-brand">
            UniQube Pod Estimator
          </Link>
          {title && (
            <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          )}
        </div>
        {actions}
      </header>
      <main>{children}</main>
    </div>
  );
};
