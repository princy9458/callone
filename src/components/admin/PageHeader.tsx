
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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-24">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Icon size={28} />
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl  uppercase tracking-widest font-bold ">{title}</h1>
          {description && <p className="text-sm font-medium ">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
    // </div>
  );
}
