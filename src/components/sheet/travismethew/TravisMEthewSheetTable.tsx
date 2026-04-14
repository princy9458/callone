"use client";

import { Loader2, Package2 } from "lucide-react";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/admin/DataTable";
import { RootState } from "@/store";
import { ProductImage } from "@/components/admin/ProductImage";
import { ITravisMethewSheetItem } from "@/store/slices/sheet/travismethew/TravisMethewSheetType";
import { usePathname } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
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

  const {travismathew}= useSelector((state:RootState)=>state.travisMathew)
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterData>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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

  const handleToggleRow = useCallback((key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);


  const handleFilterChange = useCallback((key: string, data: Partial<ColumnFilterData>) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { selection: '(All)', operator: 'contains', searchValue: '' }),
        ...data
      }
    }));
  }, []);

  const currentAttribute = useMemo(() => {
    return allAttribute.find((attr) => attr.name === "Travis Mathew sheet")
  }, [allAttribute])

  const filteredRows = useMemo(() => {
    return allTravisSheet.filter(row => {
      return Object.entries(columnFilters).every(([key, filter]) => {
        const value = getRowValue(row, key);
        
        // 1. Selection match
        if (filter.selection !== '(All)' && String(value ?? '') !== filter.selection) {
          return false;
        }
        
        // 2. Operator match
        if (filter.searchValue || filter.operator === 'blank' || filter.operator === 'notBlank') {
          const strValue = String(value ?? '').toLowerCase();
          const lowerSearch = filter.searchValue.toLowerCase();
          
          switch (filter.operator) {
            case 'contains': if(!strValue.includes(lowerSearch)) return false; break;
            case 'notContains': if(strValue.includes(lowerSearch)) return false; break;
            case 'equals': if(strValue !== lowerSearch) return false; break;
            case 'notEquals': if(strValue === lowerSearch) return false; break;
            case 'startsWith': if(!strValue.startsWith(lowerSearch)) return false; break;
            case 'endsWith': if(!strValue.endsWith(lowerSearch)) return false; break;
            case 'blank': if(value && value !== '') return false; break;
            case 'notBlank': if(!value || value === '') return false; break;
          }
        }
        
        return true;
      });
    });
  }, [allTravisSheet, columnFilters]);

  const handleToggleAll = useCallback(() => {
    setSelectedKeys(prev => {
      if (prev.size === filteredRows.length && filteredRows.length > 0) return new Set();
      return new Set(filteredRows.map((row, index) => row.SKU || row.Option || String(index)));
    });
  }, [filteredRows]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(columnFilters).some(
      f => f.selection !== '(All)' || f.searchValue !== '' || f.operator === 'blank' || f.operator === 'notBlank'
    );
  }, [columnFilters]);

  const handleClearFilters = useCallback(() => {
    setColumnFilters({});
  }, []);

  const columns = useMemo(() => {
    const rawCols = currentAttribute?.attributes && currentAttribute.attributes.length > 0
      ? currentAttribute.attributes
          .filter((attr) => attr.show !== false && attr.key !== "index" && attr.label !== "#")
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
            checked={selectedKeys.size > 0 && selectedKeys.size === filteredRows.length}
            onChange={handleToggleAll}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary"
          />
        ), 
        key: "selection" as any 
      },
      { label: "#", key: "index" as SheetColumnKey }, 
      { label: "Image", key: "image" as any },
      ...rawCols
    ];

    return fullCols.map(col => ({
      ...col,
      renderFilter: (label: React.ReactNode) => {
        if (col.key === "index" || col.key === "selection") return null;

        const uniqueValues = Array.from(new Set(allTravisSheet.map(row => String(getRowValue(row, col.key) ?? ''))))
          .filter(Boolean)
          .sort()
          .slice(0, 100);

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
    }));
  }, [currentAttribute, allTravisSheet, columnFilters, handleFilterChange, selectedKeys, filteredRows, handleToggleAll]);



  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/60 bg-[color:var(--surface)] px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Travis Mathew Sheet</h2>
          <p className="mt-1 text-sm text-foreground/56">
            Showing rows from the <span className="font-medium text-foreground">sheet_travismethew</span> collection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
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
              {filteredRows.length} of {allTravisSheet.length} Rows
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
        {isLoading && filteredRows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-14 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#1a1a1a] text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">Loading Travis Mathew sheet</h3>
                <p className="mt-2 text-sm text-foreground/56">
                  Fetching all rows from the collection.
                </p>
              </div>
            </td>
          </tr>
        ) : filteredRows.length > 0 ? (
          filteredRows.map((row, index) => {
            const rowKey = `${row.SKU || row.Option || 'row'}-${index}`;

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
                          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary"
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
                    console.log("skuiiiii",skuValue)
                      const currentSku= travismathew.find((item)=>item.sku===skuValue)
                       console.log("currentSku",currentSku)
                      
                    return (
                      <td key={`${skuValue}-image`} className="whitespace-nowrap border-b border-border/40 px-4 py-3 align-top">
                        {currentSku ? (
                          <ProductImage
                            brandName="Travis Mathew"
                            rowData={currentSku}
                            className="h-11 w-11 shadow-lg shadow-black/20"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1D1D1D] text-[10px] font-bold uppercase tracking-wider text-white/20 ring-1 ring-white/5">
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
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#1a1a1a] text-white">
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
    </section>
  );
}
