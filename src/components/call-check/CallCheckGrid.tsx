'use client';

import {AgGridReact} from "ag-grid-react";
import type {ColDef, CellValueChangedEvent} from "ag-grid-community";
import type {CallCheckRow} from "@/components/call-check/types";

type CallCheckGridProps = {
  gridRef: React.RefObject<AgGridReact<CallCheckRow>>;
  rowData: CallCheckRow[];
  columnDefs: ColDef<CallCheckRow>[];
  defaultColDef: ColDef<CallCheckRow>;
  isDarkGrid: boolean;
  onCellValueChanged: (params: CellValueChangedEvent<CallCheckRow>) => void;
};

export function CallCheckGrid({
  gridRef,
  rowData,
  columnDefs,
  defaultColDef,
  isDarkGrid,
  onCellValueChanged,
}: CallCheckGridProps) {
  return (
    <section className="premium-card overflow-hidden rounded-[28px]">
      <div className="border-b border-border/60 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
              Data grid
            </p>
            <p className="mt-1 text-sm text-foreground/56">
              Inline edits on saved rows are written back to the database automatically.
            </p>
          </div>
          <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/50">
            AG Grid
          </span>
        </div>
      </div>

      <div
        className={`${isDarkGrid ? "ag-theme-quartz-dark" : "ag-theme-quartz"} h-[68vh] w-full`}
        style={{
          ["--ag-font-size" as string]: "13px",
          ["--ag-font-family" as string]: "var(--font-geist-sans), system-ui, sans-serif",
        }}
      >
        <AgGridReact<CallCheckRow>
          theme="legacy"
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          animateRows
          rowHeight={38}
          headerHeight={40}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </section>
  );
}
