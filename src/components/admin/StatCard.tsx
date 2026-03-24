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
    <div className="premium-card rounded-[24px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">{label}</p>
          <p className="mt-3 text-[2rem] font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
          <Icon size={18} />
        </div>
      </div>
      {hint ? <p className="mt-3 text-xs leading-5 text-foreground/55">{hint}</p> : null}
    </div>
  );
}
