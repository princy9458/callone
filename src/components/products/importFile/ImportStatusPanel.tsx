'use client';

import { AlertCircle, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';

export type ImportStatus = 'idle' | 'uploading' | 'success' | 'error';

export type ImportIssue = {
  rowIndex: number;
  sku: string;
  reason: string;
};

export type ImportSummary = {
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  failedCount: number;
  savedCount: number;
  rowErrors: ImportIssue[];
};

type Props = {
  file: File;
  status: ImportStatus;
  progress: number;
  progressLabel: string;
  summary: ImportSummary | null;
  onClear: () => void;
  disableClear?: boolean;
};

export default function ImportStatusPanel({
  file,
  status,
  progress,
  progressLabel,
  summary,
  onClear,
  disableClear = false,
}: Props) {
  const visibleErrors = summary?.rowErrors?.slice(0, 8) ?? [];

  return (
    <div className="space-y-4 rounded-[20px] border border-border/70 bg-foreground/2 p-5">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-foreground/50">{(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <button
          onClick={onClear}
          className="p-1 text-foreground/40 transition-colors hover:text-danger disabled:opacity-40"
          disabled={disableClear}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryTile label="Total rows" value={String(summary?.totalRows ?? 0)} />
        <SummaryTile label="Inserted" value={String(summary?.insertedCount ?? 0)} />
        <SummaryTile label="Updated" value={String(summary?.updatedCount ?? 0)} />
        <SummaryTile label="Failed" value={String(summary?.failedCount ?? 0)} />
      </div>

      {(status === 'uploading' || progress > 0) && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-primary">
            <span>{progressLabel || 'Importing rows...'}</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 text-emerald-500">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">
            Import completed. Saved {summary?.savedCount ?? 0} row(s) to the database.
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">
            {summary?.savedCount
              ? `Import completed with ${summary.failedCount} failed row(s).`
              : 'No data was saved to the database.'}
          </span>
        </div>
      )}

      {visibleErrors.length ? (
        <div className="rounded-[18px] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Import issues</p>
            <p className="text-xs text-foreground/52">
              Showing {visibleErrors.length} of {summary?.rowErrors.length ?? 0}
            </p>
          </div>
          <div className="mt-3 max-h-48 space-y-2 overflow-auto pr-2">
            {visibleErrors.map((issue, index) => (
              <div
                key={`${issue.sku || 'row'}-${issue.rowIndex}-${index}`}
                className="rounded-2xl border border-border/70 bg-[color:var(--surface)] px-3 py-2 text-xs text-foreground/66"
              >
                <div className="font-semibold text-foreground">
                  Row {issue.rowIndex + 2}
                  {issue.sku ? ` · ${issue.sku}` : ''}
                </div>
                <div className="mt-1 text-foreground/58">{issue.reason}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-background/80 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/46">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
