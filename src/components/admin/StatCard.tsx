import {LucideIcon} from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="group premium-card p-6 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/8 bg-foreground/5 text-foreground transition-all duration-300 group-hover:bg-foreground/10">
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      {hint ? (
        <div className="mt-4 flex items-center gap-1.5 text-sm text-muted">
          <span className="h-1 w-1 rounded-full bg-primary/30" />
          {hint}
        </div>
      ) : null}
    </div>
  )}
