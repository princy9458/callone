type DataTableProps = {
  headers: string[];
  children: React.ReactNode;
};

export function DataTable({headers, children}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-border/60 bg-[color:var(--surface)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/60 text-left text-sm">
          <thead className="bg-[#111111] text-white">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-[color:var(--surface)] [&_tr]:transition-colors [&_tr:hover]:bg-primary/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
