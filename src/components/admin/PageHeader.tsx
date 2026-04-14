
import React from "react";
import { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
};

export function PageHeader({ title, description, action, icon: Icon }: PageHeaderProps) {
  return (
    // <div className="premium-card overflow-hidden rounded-[28px] p-4">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mt-12 mb-8">
      <div className="flex items-center gap-6">
        {Icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/5">
            <Icon size={24} />
          </div>
        )}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold uppercase tracking-[0.1em] text-foreground">{title}</h1>
          {description && <p className="max-w-2xl text-sm font-medium text-muted-foreground/60 leading-relaxed">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
    // </div>
  );
}
