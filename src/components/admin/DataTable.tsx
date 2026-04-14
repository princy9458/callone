export type DataTableHeader = string | {
  label: React.ReactNode;
  key?: string;
  renderFilter?: (label: React.ReactNode) => React.ReactNode;
};

type DataTableProps = {
  headers: DataTableHeader[];
  children: React.ReactNode;
};

export function DataTable({headers, children}: DataTableProps) {
  return (
    <div className="overflow-clip rounded-[24px] border border-border/60 bg-[color:var(--surface)]">
      <div className="w-full max-h-[calc(100vh-250px)] overflow-auto rounded-b-[16px]">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-surface-muted/50 text-foreground">
              {headers.map((item, index) => {
                const label = typeof item === 'string' ? item : item.label;
                const renderFilter = typeof item === 'object' ? item.renderFilter : undefined;
                
                return (
                  <th
                    key={`${label}-${index}`}
                    className="sticky z-20 whitespace-nowrap border-b border-border bg-surface-muted/80 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 backdrop-blur-md"
                    style={{top: 0}}
                  >
                    <div className="flex flex-col gap-2">
                       <span>{label}</span>
                       {renderFilter && (
                         <div className="mt-1 flex items-center gap-1.5 font-normal normal-case tracking-normal">
                           {renderFilter(label)}
                         </div>
                       )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border/30 [&_tr:nth-child(even)]:bg-foreground/[0.015] [&_tr]:transition-all [&_tr:hover]:bg-primary/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
