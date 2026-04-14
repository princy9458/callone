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
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
          <Icon size={20} />
        </div>
      </div>
      {hint ? (
        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/50">
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          {hint}
        </div>
      ) : null}
    </div>
  );
}
