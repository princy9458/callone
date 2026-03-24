import Link from "next/link";
import {ChevronLeft} from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55 transition hover:text-foreground"
          >
            <ChevronLeft size={16} />
            Back
          </Link>
        ) : null}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
            Admin module
          </p>
          <h1 className="text-[2rem] font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-foreground/60">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
    </div>
  );
}
