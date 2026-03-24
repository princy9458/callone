export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-border/80 bg-slate-950/[0.02] px-6 py-12 text-center dark:bg-white/[0.02]">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-foreground/60">{description}</p>
    </div>
  );
}
