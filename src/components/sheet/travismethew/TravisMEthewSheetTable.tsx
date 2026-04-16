"use client";

import { 
  Loader2, 
  Package2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/admin/DataTable";
import { RootState } from "@/store";
import { ProductImage } from "@/components/admin/ProductImage";
import { ITravisMethewSheetItem } from "@/store/slices/sheet/travismethew/TravisMethewSheetType";
import { usePathname } from "next/navigation";
import { useMemo, useState, useCallback, startTransition, useEffect } from "react";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  ColumnFilterData,
  FilterOperator,
  SelectionFilter,
  FloatingFilterPopup
} from "./ColumnFilters";
import { convertOffsetToTimes } from "framer-motion";

type SheetColumnKey = keyof ITravisMethewSheetItem | "index";



function formatSheetValue(key: SheetColumnKey, value: unknown) {
  if (key === "index") {
    return "";
  }

  if (key === "createdAt" || key === "updatedAt") {
    if (!value) return "—";

    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function getRowValue(row: ITravisMethewSheetItem, key: string) {
  if (!key || key === "index") return undefined;

  const source = row as Record<string, any>;

  // 1. Direct match
  if (key in source) return source[key];

  // 2. Case-insensitive match
  const rowKeys = Object.keys(source);
  const matchedKey = rowKeys.find((rk) => rk.toLowerCase() === key.toLowerCase());
  if (matchedKey) return source[matchedKey];

  // 3. Common aliases mapping
  const normalizedKey = key.toLowerCase().trim();
  const aliases: Record<string, string[]> = {
    desc: ["description", "desc", "product description", "details"],
    SKU: ["sku", "style code", "style", "item code", "code"],
    SZ: ["size", "sz", "size roll", "fit", "sze"],
    mrp: ["mrp", "price", "rate", "cost"],
    color: ["color", "colour", "shade", "color code"],
    category: ["category", "cat", "product type"],
    season: ["season", "ss", "fw", "collection"],
  };

  for (const [realKey, aliasList] of Object.entries(aliases)) {
    if (aliasList.includes(normalizedKey)) {
      if (realKey in source) return source[realKey];
      // Try case-insensitive alias search if direct alias key not found
      const foundKey = rowKeys.find((rk) => rk.toLowerCase() === realKey.toLowerCase());
      if (foundKey) return source[foundKey];
    }
  }

  return undefined;
}

function getBaseSku(sku: unknown): string {
  if (!sku) return "";
  const s = String(sku).trim();
  const parts = s.split("_");
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[1]}`;
  }
  return s;
}

export default function TravisMEthewSheetTable() {
  const { allTravisSheet, isLoading, error } = useSelector((state: RootState) => state.travisSheet);
  const { allAttribute } = useSelector((state: RootState) => state.attribute);

  const { travismathew } = useSelector((state: RootState) => state.travisMathew)
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterData>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, sorting]);
  const travisMathewMap = useMemo(() => {
    const map = new Map<string, any>();
    if (Array.isArray(travismathew)) {
      travismathew.forEach(item => {
        if (item.sku) {
          map.set(getBaseSku(item.sku).toUpperCase(), item);
        }
      });
    }
    return map;
  }, [travismathew]);

  const handleSort = useCallback((key: string) => {
    setSorting(prev => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  }, []);
  const handleToggleRow = useCallback((key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);


const handleFilterChange = useCallback((key: string, data: Partial<ColumnFilterData>) => {
  startTransition(() => {
    setColumnFilters(prev => {
      // 1. Get previous state or default
      const prevFilter = prev[key] || {
        selection: [],
        operator: 'contains',
        searchValue: ''
      };

      // 2. Fix: Use prevFilter here instead of currentFilter
      let newSelection = Array.isArray(prevFilter.selection) ? [...prevFilter.selection] : [];

      if (data.selection !== undefined) {
        const value = data.selection as unknown as string; // Cast because data.selection might be string[] in some contexts

        if (value === '(All)') {
          newSelection = []; 
        } else {
          const index = newSelection.indexOf(value);
          if (index > -1) {
            newSelection.splice(index, 1);
          } else {
            newSelection.push(value);
          }
        }
      }

      const updatedFilter = {
        ...prevFilter,
        ...data,
        selection: newSelection
      };

      if (data.searchValue !== undefined && data.searchValue !== '') {
        updatedFilter.selection = [];
      }

      return { ...prev, [key]: updatedFilter };
    });
  });
}, []);
  const currentAttribute = useMemo(() => {
    return allAttribute.find((attr) => attr.name === "Travis Mathew sheet")
  }, [allAttribute])


  console.log(columnFilters)
  const uniqueValuesByColumn = useMemo(() => {
    const values: Record<string, string[]> = {};
    if (!currentAttribute?.attributes) return values;

    currentAttribute.attributes.forEach(attr => {
      const key = attr.key as string;
      if (!key || attr.show === false) return;

      const unique = Array.from(new Set(allTravisSheet.map(row => String(getRowValue(row, key) ?? ''))))
        .filter(Boolean)
        .sort()
        .slice(0, 100);
      values[key] = unique;
    });

    return values;
  }, [allTravisSheet, currentAttribute]);
const filteredRows = useMemo(() => {
  return allTravisSheet.filter(row => {
    return Object.entries(columnFilters).every(([key, filter]) => {
      const value = getRowValue(row, key);
      const strValue = String(value ?? '');

      // 1. Updated Selection Match: Check if array has items and includes value
      if (filter.selection && filter.selection.length > 0) {
        if (!filter.selection.includes(strValue)) {
          return false;
        }
      }

      // 2. Operator match
      if (filter.searchValue || filter.operator === 'blank' || filter.operator === 'notBlank') {
        const lowerValue = strValue.toLowerCase();
        const lowerSearch = filter.searchValue.toLowerCase();

        switch (filter.operator) {
          case 'contains': if (!lowerValue.includes(lowerSearch)) return false; break;
          case 'notContains': if (lowerValue.includes(lowerSearch)) return false; break;
          case 'equals': if (lowerValue !== lowerSearch) return false; break;
          case 'notEquals': if (lowerValue === lowerSearch) return false; break;
          case 'startsWith': if (!lowerValue.startsWith(lowerSearch)) return false; break;
          case 'endsWith': if (!lowerValue.endsWith(lowerSearch)) return false; break;
          case 'blank': if (value && value !== '') return false; break;
          case 'notBlank': if (!value || value === '') return false; break;
        }
      }

      return true;
    });
  });
}, [allTravisSheet, columnFilters]);

  const sortedRows = useMemo(() => {
    if (!sorting.key) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const valA = getRowValue(a, sorting.key as string);
      const valB = getRowValue(b, sorting.key as string);

      if (valA == null && valB == null) return 0;
      if (valA == null) return sorting.direction === "asc" ? 1 : -1;
      if (valB == null) return sorting.direction === "asc" ? -1 : 1;

      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB) && String(valA).trim() !== '' && String(valB).trim() !== '') {
        return sorting.direction === "asc" ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sorting.direction === "asc" ? -1 : 1;
      if (strA > strB) return sorting.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sorting]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedRows.slice(start, end);
  }, [sortedRows, currentPage, pageSize]);

  const handleToggleAll = useCallback(() => {
    setSelectedKeys(prev => {
      if (prev.size === sortedRows.length && sortedRows.length > 0) return new Set();
      return new Set(sortedRows.map((row) => {
        const originalIndex = allTravisSheet.indexOf(row);
        return (row as any)._id || `${row.SKU || row.Option || 'row'}-${originalIndex}`;
      }));
    });
  }, [sortedRows, allTravisSheet]);

const hasActiveFilters = useMemo(() => {
  return Object.values(columnFilters).some(
    f => (f.selection && f.selection.length > 0) || f.searchValue !== '' || f.operator === 'blank' || f.operator === 'notBlank'
  );
}, [columnFilters]);

  const handleClearFilters = useCallback(() => {
    setColumnFilters({});
  }, []);

  const columns = useMemo(() => {
    const rawCols = currentAttribute?.attributes && currentAttribute.attributes.length > 0
      ? currentAttribute.attributes
        .filter((attr) => attr.show !== false && attr.key !== "index" && attr.label !== "#" && attr.key?.toLowerCase() !== "image" && attr.label?.toLowerCase() !== "image")
        .map((attr) => ({
          label: attr.label || attr.key || "",
          key: (attr.key || "") as SheetColumnKey,
        }))
      : [];

    const fullCols = [
      {
        label: (
          <input
            type="checkbox"
            checked={selectedKeys.size > 0 && selectedKeys.size === sortedRows.length}
            onChange={handleToggleAll}
            className="h-4 w-4 rounded border-border/20 bg-card/5 accent-primary"
          />
        ),
        key: "selection" as any
      },
      { label: "#", key: "index" as SheetColumnKey },
      { label: "Image", key: "image" as any },
      ...rawCols
    ];

    return fullCols.map(col => {
      const isSortable = col.key !== "selection" && col.key !== "index" && col.key !== "image";
      return ({
        ...col,
        label: isSortable ? (
          <div
            onClick={() => handleSort(col.key as string)}
            className="flex cursor-pointer select-none items-center gap-1"
          >
            {col.label}

            {sorting.key === col.key && (
              <span className="text-xs">
                {sorting.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        ) : (
          col.label
        ),
        renderFilter: (label: React.ReactNode) => {
          if (col.key === "index" || col.key === "selection" || col.key === "image") return null;

          const uniqueValues = uniqueValuesByColumn[col.key as string] || [];

          return (
            <div className="flex items-center gap-1.5 pt-1">
              <SelectionFilter
                columnKey={col.key}
                uniqueValues={uniqueValues}
                currentFilter={columnFilters[col.key] || { selection: '(All)', operator: 'contains', searchValue: '' }}
                onFilterChange={handleFilterChange}
              />
              <FloatingFilterPopup
                columnKey={col.key}
                currentFilter={columnFilters[col.key] || { selection: '(All)', operator: 'contains', searchValue: '' }}
                onFilterChange={handleFilterChange}
              />
            </div>
          );
        }
      })
    }
    );
  }, [currentAttribute, allTravisSheet, columnFilters, handleFilterChange, selectedKeys, sortedRows, handleToggleAll]);



  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/60 bg-[color:var(--surface)] px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Travis Mathew Sheet</h2>
          <p className="mt-1 text-sm text-foreground/56">
            Showing rows from the <span className="font-medium text-foreground">sheet_travismethew</span> collection.
          </p>



        </div>
        {columnFilters && Object.keys(columnFilters).length > 0 && <div className="flex items-center gap-3">
          {Object.keys(columnFilters).map((key) => {
            const filter = columnFilters[key];
            return (
              <div key={key} className="flex items-center gap-1.5">
                <button className="text-xs font-semibold text-foreground">{key}:</button>
                <span className="text-xs text-foreground/60">{filter.selection}</span>
              </div>
            );
          })}
        </div>}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-border/10 bg-card/[0.04] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-card/[0.08]"
            >
              Clear filters
            </button>
          )}

          <div className="flex items-center gap-3 text-sm text-foreground/56">
            {isLoading ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading
              </span>
            ) : (
              <span className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
                {sortedRows.length} of {allTravisSheet.length} Rows
              </span>
            )}
          </div>
        </div>
      </div>
      {error ? (
        <div className="rounded-[20px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <DataTable headers={columns}>
        {isLoading && paginatedRows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-14 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-card text-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">Loading Travis Mathew sheet</h3>
                <p className="mt-2 text-sm text-foreground/56">
                  Fetching all rows from the collection.
                </p>
              </div>
            </td>
          </tr>
        ) : paginatedRows.length > 0 ? (
          paginatedRows.map((row, index) => {
            const originalIndex = allTravisSheet.indexOf(row);
            const rowKey = (row as any)._id || `${row.SKU || row.Option || 'row'}-${originalIndex}`;

            return (
              <tr key={rowKey}>
                {columns.map((column) => {
                  if (column.key === "selection" as any) {
                    return (
                      <td key={`${rowKey}-selection`} className="whitespace-nowrap border-b border-border/40 px-4 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(rowKey)}
                          onChange={() => handleToggleRow(rowKey)}
                          className="h-4 w-4 rounded border-border/20 bg-card/5 accent-primary"
                        />
                      </td>
                    );
                  }

                  if (column.key === "index") {
                    return (
                      <td key={`${rowKey}-index`} className="whitespace-nowrap border-b border-border/40 px-4 py-3 align-top text-xs font-semibold text-foreground/60">
                        {index + 1}
                      </td>
                    );
                  }

                  if (column.key === "image" as any) {
                    const skuValue = getRowValue(row, "SKU");
                    const baseSku = getBaseSku(skuValue).toUpperCase();
                    const currentSku = travisMathewMap.get(baseSku);

                    return (
                      <td key={`${rowKey}-image`} className="whitespace-nowrap border-b border-border/40 px-4 py-3 align-top">
                        {currentSku ? (
                          <ProductImage
                            brandName="Travis Mathew"
                            rowData={currentSku}
                            className="h-11 w-11 shadow-lg shadow-black/20"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[10px] font-bold uppercase tracking-wider text-foreground/20 ring-1 ring-border/5">
                            No Img
                          </div>
                        )}
                      </td>
                    );
                  }

                  const value = getRowValue(row, column.key);
                  const cellValue = formatSheetValue(column.key, value);
                  const isDescription = column.key === "desc";

                  return (
                    <td
                      key={`${rowKey}-${column.key}--12`}
                      className="whitespace-nowrap border-b border-border/40 px-4 py-3 align-top text-sm text-foreground/80"
                    >
                      <span
                        className={isDescription ? "block max-w-[260px] truncate" : "block"}
                        title={cellValue}
                      >
                        {cellValue}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={columns.length} className="px-6 py-14 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-card text-foreground">
                  <Package2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">No Travis Mathew rows found</h3>
                <p className="mt-2 text-sm text-foreground/56">
                  Upload the Excel sheet to populate this collection.
                </p>
              </div>
            </td>
          </tr>
        )}
      </DataTable>

      {/* Pagination Controls */}
      {sortedRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border/60 bg-[color:var(--surface)] px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground/56">Rows per page:</span>
              <div className="w-24">
                <PremiumSelect
                  value={String(pageSize)}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "20", label: "20" },
                    { value: "50", label: "50" },
                    { value: "100", label: "100" },
                    { value: "200", label: "200" },
                  ]}
                  triggerClassName="h-9 px-3"
                />
              </div>
            </div>
            <span className="text-xs font-medium text-foreground/56">
              Showing {Math.min((currentPage - 1) * pageSize + 1, sortedRows.length)} to {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length} rows
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-card/5 text-foreground/60 transition-colors hover:bg-card/10 disabled:opacity-30"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-card/5 text-foreground/60 transition-colors hover:bg-card/10 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center px-4">
              <span className="text-xs font-bold text-foreground">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-card/5 text-foreground/60 transition-colors hover:bg-card/10 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-card/5 text-foreground/60 transition-colors hover:bg-card/10 disabled:opacity-30"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

