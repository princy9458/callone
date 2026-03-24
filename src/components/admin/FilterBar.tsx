export function FilterBar({children}: {children: React.ReactNode}) {
  return (
    <div className="premium-card flex flex-col gap-3 rounded-[22px] p-3 lg:flex-row lg:items-center lg:justify-between">
      {children}
    </div>
  );
}
