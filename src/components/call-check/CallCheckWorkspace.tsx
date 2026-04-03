'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {AgGridReact} from "ag-grid-react";
import {AllCommunityModule, ColDef, CellValueChangedEvent, ModuleRegistry, ValueFormatterParams} from "ag-grid-community";
import * as XLSX from "xlsx";
import {FileSpreadsheet} from "lucide-react";
import {CallCheckDropzone} from "@/components/call-check/CallCheckDropzone";
import {CallCheckEmptyState} from "@/components/call-check/CallCheckEmptyState";
import {CallCheckGrid} from "@/components/call-check/CallCheckGrid";
import {CallCheckSheetTabs} from "@/components/call-check/CallCheckSheetTabs";
import {CallCheckToolbar} from "@/components/call-check/CallCheckToolbar";
import {CallCheckSaveModal} from "@/components/call-check/CallCheckSaveModal";

import {UniqueValueFloatingFilter} from "@/components/call-check/UniqueValueFloatingFilter";
import type {CallCheckDataset, CallCheckRow} from "@/components/call-check/types";
import ImportStatusPanel, { ImportIssue, ImportStatus, ImportSummary } from "../products/importFile/ImportStatusPanel";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { setTravisMathew } from "@/store/slices/travisMathewSlice/travisMathewSlice";
import { createTravisMathew } from "@/store/slices/travisMathewSlice/travisMathewThunks";

ModuleRegistry.registerModules([AllCommunityModule]);

type CallCheckWorkspaceProps = {
  initialDatasets: CallCheckDataset[];
  initialDatasetSlug?: string | null;
};

function buildImageUrl(baseSku: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(baseSku)}/50/50`;
}

function ImageCellRenderer(params: {data?: CallCheckRow}) {
  const keys = Object.keys(params.data ?? {}).filter((key) => key !== "_id" && key !== "imageUrl");
  const baseSkuKey = keys.find((key) => key.toLowerCase().includes("base")) || keys[1] || keys[0];
  const baseSku = String(params.data?.[baseSkuKey] ?? "").trim();

  if (!baseSku) {
    return null;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <img src={buildImageUrl(baseSku)} alt={baseSku} className="h-7 w-7 rounded object-cover shadow-sm" />
    </div>
  );
}

export function CallCheckWorkspace({
  initialDatasets,
  initialDatasetSlug = null,
}: CallCheckWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridReact<CallCheckRow>>(null);

  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [datasets, setDatasets] = useState(initialDatasets);
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [rowData, setRowData] = useState<CallCheckRow[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef<CallCheckRow>[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkGrid, setIsDarkGrid] = useState(false);
  const [activeDatasetSlug, setActiveDatasetSlug] = useState(initialDatasetSlug ?? "");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { currentBrand } = useSelector((state: RootState) => state.brand);
  const { currentAttribute } = useSelector((state: RootState) => state.attribute);
  const { travismathew } = useSelector((state: RootState) => state.travisMathew);


  const syncSheetParam = useCallback(
    (slug: string | null) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (slug) {
        nextParams.set("sheet", slug);
      } else {
        nextParams.delete("sheet");
      }
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {scroll: false});
    },
    [pathname, router, searchParams]
  );

  const defaultColDef = useMemo<ColDef<CallCheckRow>>(
    () => ({
      minWidth: 120,
      filter: true,
      floatingFilter: true,
      resizable: true,
      sortable: true,
      editable: true,
    }),
    []
  );

  const setGridData = useCallback((rows: CallCheckRow[], cols: ColDef<CallCheckRow>[]) => {
    setRowData(rows);
    setColumnDefs(cols);
  }, []);

  const buildUniqueValueFilterColumn = useCallback(
    (field: string, headerName: string, uniqueVals: Record<string, string[]>, valueFormatter?: ColDef<CallCheckRow>["valueFormatter"]) =>
      ({
        field,
        headerName,
        headerClass: "font-bold",
        filter: "agTextColumnFilter",
        floatingFilter: true,
        floatingFilterComponent: UniqueValueFloatingFilter,
        floatingFilterComponentParams: {
          uniqueValues: uniqueVals[field] || [],
        },
        filterParams: {buttons: ["reset", "apply"], closeOnApply: true},
        valueFormatter,
      }) satisfies ColDef<CallCheckRow>,
    []
  );

  const buildColumnsFromObjects = useCallback((rows: CallCheckRow[], uniqueVals: Record<string, string[]> = {}) => {
    const keys = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row).forEach((key) => {
          if (key !== "_id") {
            set.add(key);
          }
        });
        return set;
      }, new Set<string>())
    );

    const cols: ColDef<CallCheckRow>[] = [
      {
        headerName: "Image",
        field: "imageUrl",
        cellRenderer: ImageCellRenderer as never,
        width: 88,
        pinned: "left",
        suppressSizeToFit: true,
        sortable: false,
        filter: false,
        editable: false,
        resizable: false,
      },
      ...keys.map((key) => buildUniqueValueFilterColumn(key, key, uniqueVals)),
    ];

    return cols;
  }, [buildUniqueValueFilterColumn]);

  const openDataset = useCallback(
    async (slug: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/call-check/sheets/${encodeURIComponent(slug)}`);
        if (!response.ok) {
          throw new Error("Failed to load dataset");
        }

        const payload = (await response.json()) as {
          dataset: CallCheckDataset;
          rows: CallCheckRow[];
        };

        const uniqueVals = payload.dataset.uniqueValues || {};
       // setCurrentUniqueValues(uniqueVals);

        setDatasets((current) => {
          if (current.some((item) => item.id === payload.dataset.id)) {
            return current;
          }
          return [payload.dataset, ...current];
        });
        setWorkbook(null);
        setSheets([payload.dataset.name]);
        setActiveSheet(payload.dataset.name);
        setActiveDatasetSlug(payload.dataset.slug);
        
        setGridData(payload.rows, buildColumnsFromObjects(payload.rows, uniqueVals));
        syncSheetParam(payload.dataset.slug);
      } catch (error) {
        console.error(error);
        window.alert("Failed to open dataset.");
      } finally {
        setIsLoading(false);
      }
    },
    [buildColumnsFromObjects, setGridData, syncSheetParam]
  );

  useEffect(() => {
    if (initialDatasetSlug && initialDatasetSlug !== activeDatasetSlug) {
      void openDataset(initialDatasetSlug);
    }
  }, [activeDatasetSlug, initialDatasetSlug, openDataset]);

  const processRowsFromSheet = useCallback((rawData: unknown[][], uniqueVals: Record<string, string[]> = {}) => {
    if (!rawData.length) {
      return {rows: [] as CallCheckRow[], cols: [] as ColDef<CallCheckRow>[]};
    }

    let headerRowIndex = 0;
    let maxColumns = 0;

    for (let index = 0; index < Math.min(rawData.length, 20); index += 1) {
      const row = rawData[index] ?? [];
      const validColumnCount = row.filter((value) => value !== null && value !== undefined && value !== "").length;
      if (validColumnCount > maxColumns) {
        maxColumns = validColumnCount;
        headerRowIndex = index;
      }
    }

    const headers = (rawData[headerRowIndex] ?? []) as unknown[];
    const dataRows = rawData.slice(headerRowIndex + 1);
    const fieldNames: string[] = [];

    const cols: ColDef<CallCheckRow>[] = [
      {
        headerName: "Image",
        field: "imageUrl",
        cellRenderer: ImageCellRenderer as never,
        width: 88,
        pinned: "left",
        suppressSizeToFit: true,
        sortable: false,
        filter: false,
        editable: false,
        resizable: false,
      },
    ];

    headers.forEach((header, index) => {
      const fieldName = header ? String(header).trim() : `Column ${index + 1}`;
      let uniqueName = fieldName;
      let counter = 1;

      while (fieldNames.includes(uniqueName)) {
        uniqueName = `${fieldName}_${counter}`;
        counter += 1;
      }

      fieldNames.push(uniqueName);

      let isDate = false;

      for (let rowIndex = 0; rowIndex < Math.min(dataRows.length, 100); rowIndex += 1) {
        const row = dataRows[rowIndex] ?? [];
        const value = row[index];

        if (value !== null && value !== undefined && value !== "") {
          if (value instanceof Date) {
            isDate = true;
          }
          break;
        }
      }

      cols.push(
        buildUniqueValueFilterColumn(
          uniqueName,
          fieldName,
          uniqueVals,
          isDate
            ? ((params: ValueFormatterParams) =>
                params.value ? new Date(params.value as string | number | Date).toLocaleDateString() : "") as never
            : undefined
        )
      );
    });

    const rows = dataRows.map((row) => {
      const output: CallCheckRow = {};
      fieldNames.forEach((field, index) => {
        output[field] = row[index];
      });
      return output;
    });

    return {rows, cols};
  }, [buildUniqueValueFilterColumn]);

  const loadSheetData = useCallback(
    (nextWorkbook: XLSX.WorkBook, name: string) => {
      const worksheet = nextWorkbook.Sheets[name];
      const rawData = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: null}) as unknown[][];
      
      // We need to compute unique values FIRST to pass them to processRowsFromSheet
      const previewProcessed = processRowsFromSheet(rawData);
      const computed: Record<string, string[]> = {};
      const fields = previewProcessed.cols.map((c) => String(c.field ?? "")).filter((f) => f && f !== "imageUrl");
      
      fields.forEach((field) => {
        const values = new Set<string>();
        previewProcessed.rows.forEach((row) => {
          const val = row[field];
          if (val !== null && val !== undefined && val !== "") {
            values.add(String(val).trim());
          }
        });
        if (values.size > 0) {
          computed[field] = Array.from(values).sort();
        }
      });
     // setCurrentUniqueValues(computed);

      const processed = processRowsFromSheet(rawData, computed);

      setActiveSheet(name);
      setActiveDatasetSlug("");
      setGridData(processed.rows, processed.cols);
      syncSheetParam(null);
    },
    [processRowsFromSheet, setGridData, syncSheetParam]
  );
  // console.log("rowData",rowData)
  const processFile = useCallback(
    (uploadedFile: File) => {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        try {
          const nextWorkbook = XLSX.read(result, {type: "binary", cellDates: true});
          setWorkbook(nextWorkbook);
          setSheets(nextWorkbook.SheetNames);
          if (nextWorkbook.SheetNames.length) {
            loadSheetData(nextWorkbook, nextWorkbook.SheetNames[0]);
          }
        } catch (error) {
          console.error(error);
          window.alert("Failed to parse the spreadsheet. Please upload a valid Excel or CSV file.");
        }
      };
      reader.readAsBinaryString(uploadedFile);
    },
    [loadSheetData]
  );

  const loadFromUrl = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!urlInput.trim()) {
        return;
      }

      setIsLoading(true);
      try {
        let fetchUrl = urlInput.trim();
        const googleSheetMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (googleSheetMatch?.[1]) {
          fetchUrl = `https://docs.google.com/spreadsheets/d/${googleSheetMatch[1]}/export?format=xlsx`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch remote sheet");
        }

        const blob = await response.blob();
        const file = new File([blob], "remote-sheet.xlsx", {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        processFile(file);
        setUrlInput("");
      } catch (error) {
        console.error(error);
        window.alert("Could not load that URL. The file may be private or blocked by CORS.");
      } finally {
        setIsLoading(false);
      }
    },
    [processFile, urlInput]
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(file);
      }
      event.target.value = "";
    },
    [processFile]
  );

  const handleTravisImport = useCallback(async () => {
      if (!rowData.length) return;
        setStatus('uploading');
        setProgress(0);
        setProgressLabel('Preparing import...');
    
        const chunkSize = 100;
        const totalRows = rowData.length;
        let insertedCount = 0;
        let updatedCount = 0;
        let failedCount = 0;
        const rowErrors: ImportIssue[] = [];

        const mappedData = rowData.map((item: any) => ({
          ...item,
          attributeSetId: currentAttribute?._id,
          brandId: currentBrand?._id,
          createdAt: new Date().toISOString(),
          metaData: {
            section: ""
          }
        }));
    
        const runImport = async () => {
          try {
            for (let index = 0; index < mappedData.length; index += chunkSize) {
              const chunk = mappedData.slice(index, index + chunkSize);
              const chunkNumber = Math.floor(index / chunkSize) + 1;
              const totalChunks = Math.ceil(mappedData.length / chunkSize);
              setProgressLabel(`Importing chunk ${chunkNumber} of ${totalChunks}`);
    
              const action = await dispatch(createTravisMathew(chunk));
              const result = action.payload as any;
        
              const chunkSummary = result?.summary as ImportSummary | undefined;
    
              if (chunkSummary) {
                insertedCount += chunkSummary.insertedCount || 0;
                updatedCount += chunkSummary.updatedCount || 0;
                failedCount += chunkSummary.failedCount || 0;
                rowErrors.push(...(chunkSummary.rowErrors || []).map((issue) => ({
                  ...issue,
                  rowIndex: issue.rowIndex + index,
                })));
              } else if (createTravisMathew.rejected.match(action)) {
                failedCount += chunk.length;
                rowErrors.push(
                  ...chunk.map((item, rowIndex) => ({
                    rowIndex: index + rowIndex,
                    sku: item.sku || '',
                    reason: (action.payload as string) || 'Import failed',
                  }))
                );
              }
             console.log("insertedCount",insertedCount)
             console.log("updatedCount",updatedCount)
             
              setProgress(Math.min(100, Math.round(((index + chunk.length) / totalRows) * 100)));
              setSummary({
                totalRows,
                insertedCount,
                updatedCount,
                failedCount,
                savedCount: insertedCount + updatedCount,
                rowErrors,
              });
            }
    
            const merged = [...travismathew];
            mappedData.forEach((item) => {
              const key = item.sku || '';
              const existingIndex = merged.findIndex((product) => product.sku === key);
              if (existingIndex >= 0) {
                merged[existingIndex] = item;
              } else {
                merged.push(item);
              }
            });
            dispatch(setTravisMathew(merged));
    
            if (insertedCount + updatedCount > 0 && failedCount === 0) {
              setStatus('success');
              setProgressLabel('Import completed successfully.');
            } else {
              setStatus(insertedCount + updatedCount > 0 ? 'success' : 'error');
              setProgressLabel(
                insertedCount + updatedCount > 0
                  ? 'Import completed with some failed rows.'
                  : 'No data was saved to the database.'
              );
            }
          } catch (error: any) {
            console.error('Import failed:', error);
            setStatus('error');
            setProgressLabel(error?.message || 'Import failed');
          }
        };
    
        void runImport();
  }, [currentAttribute?._id, currentBrand?._id, dispatch, rowData, travismathew]);

  const saveToDb = useCallback(async (selectedCollections: string[] = []) => {
    if (!rowData.length) {
      return;
    }
    console.log("selectedCollections-->",selectedCollections)
      console.log("rowData-->",rowData)
      switch(selectedCollections[0]){
        case "product_travis":  
            void handleTravisImport();
            break;
      }
          
    // setIsSaving(true);
    // try {
    //   const datasetName = activeSheet || `Sheet ${new Date().toISOString().slice(0, 10)}`;
    //   const response = await fetch("/api/admin/call-check/sheets", {
    //     method: "POST",
    //     headers: {"Content-Type": "application/json"},
    //     body: JSON.stringify({
    //       name: datasetName,
    //       sourceFileName: workbook ? `${datasetName}.xlsx` : `${datasetName}.csv`,
    //       columns: columnDefs.map((column) => String(column.field ?? "")).filter((field) => field && field !== "imageUrl"),
    //       collections: selectedCollections,
    //       rows: rowData.map((row) => {
    //         const persistedRow = {...row};
    //         delete persistedRow._id;
    //         return persistedRow;
    //       }),
    //     }),
    //   });

    //   if (!response.ok) {
    //     throw new Error("Failed to save dataset");
    //   }

    //   const payload = (await response.json()) as {
    //     dataset: CallCheckDataset;
    //     rows: CallCheckRow[];
    //   };

    //   setDatasets((current) => [payload.dataset, ...current.filter((item) => item.id !== payload.dataset.id)]);
    //   setActiveDatasetSlug(payload.dataset.slug);
    //   setSheets([payload.dataset.name]);
    //   setActiveSheet(payload.dataset.name);
      
    //   if (payload.dataset.uniqueValues) {
    //    // setCurrentUniqueValues(payload.dataset.uniqueValues);
    //   }
      
    //   setGridData(payload.rows, buildColumnsFromObjects(payload.rows, payload.dataset.uniqueValues));
    //   syncSheetParam(payload.dataset.slug);
    //   window.alert(`Saved ${payload.rows.length} rows to the database.`);
    // } catch (error) {
    //   console.error(error);
    //   window.alert("Failed to save this dataset to the database.");
    // } finally {
    //   setIsSaving(false);
    // }
  }, [handleTravisImport, rowData]);
  const autoSizeAll = useCallback(() => {
    const allColumnIds: string[] = [];
    gridRef.current?.api?.getColumns()?.forEach((column) => {
      allColumnIds.push(column.getId());
    });
    if (allColumnIds.length) {
      gridRef.current?.api?.autoSizeColumns(allColumnIds, false);
    }
  }, []);

  const exportData = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv();
  }, []);

  const updateSearch = useCallback((value: string) => {
    gridRef.current?.api?.setGridOption("quickFilterText", value);
  }, []);


  const handleCellValueChanged = useCallback(async (params: CellValueChangedEvent<CallCheckRow>) => {
    const rowId = params.data?._id;
    if (!rowId) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/call-check/rows/${rowId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(params.data),
      });

      if (!response.ok) {
        throw new Error("Failed to update row");
      }
    } catch (error) {
      console.error(error);
      window.alert("Failed to persist the edited row.");
    }
  }, []);

  const hasData = rowData.length > 0;

  return (
    <>

    <div
      className="space-y-4"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file && /\.(xlsx|xls|csv)$/i.test(file.name)) {
          processFile(file);
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileUpload}
      />

      <CallCheckDropzone active={isDragging} />

      {hasData ? (
        <>
          <CallCheckToolbar
            hasData={hasData}
            isSaving={isSaving}
            isDarkGrid={isDarkGrid}
            onOpenFile={() => fileInputRef.current?.click()}
            onAutoSize={autoSizeAll}
            onExport={exportData}
            onSave={() => setIsSaveModalOpen(true)}
           
            onToggleGridTheme={() => setIsDarkGrid((current) => !current)}
            onSearchChange={updateSearch}
          />

          <CallCheckGrid
            gridRef={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            isDarkGrid={isDarkGrid}
            onCellValueChanged={handleCellValueChanged}
          />

          <section className="premium-card overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/76">
                <FileSpreadsheet className="h-4 w-4" />
                Sheet tabs
              </div>
              <span className="text-xs text-foreground/46">
                {activeDatasetSlug ? "Loaded from database" : "Loaded from local workbook"}
              </span>
            </div>
            <CallCheckSheetTabs
              sheets={sheets}
              activeSheet={activeSheet}
              onSelect={(sheet) => {
                if (workbook) {
                  loadSheetData(workbook, sheet);
                } else {
                  setActiveSheet(sheet);
                }
              }}
            />
          </section>
        </>
      ) : (
        <CallCheckEmptyState
          urlInput={urlInput}
          onUrlInputChange={setUrlInput}
          onLoadFromUrl={loadFromUrl}
          onOpenFile={() => fileInputRef.current?.click()}
          onOpenDataset={openDataset}
          datasets={datasets}
          isLoading={isLoading}
        />
      )}

      <CallCheckSaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={saveToDb}
      />

      {status !== 'idle' && file && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-border/70 bg-background shadow-2xl p-6">
            <ImportStatusPanel
              file={file}
              status={status}
              progress={progress}
              progressLabel={progressLabel}
              summary={summary}
              onClear={() => {
                setStatus('idle');
                setProgress(0);
                setProgressLabel('');
                setSummary(null);
                setIsSaveModalOpen(false); // Make sure the modal closes when done
              }}
              disableClear={status === 'uploading'}
            />
          </div>
        </div>
      )}
    </div>
      </>
  );
}
