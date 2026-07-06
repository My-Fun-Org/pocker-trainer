import { Link } from "react-router-dom";
import { ROUTES } from "@/types/training";

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** A generic page frame for tool and systems screens (no reasoning rail). */
export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.home} className="btn-ghost px-3 py-2 text-sm">
            &larr; Home
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </header>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
