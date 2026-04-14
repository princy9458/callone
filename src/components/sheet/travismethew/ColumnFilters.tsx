'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export type FilterOperator = 'contains' | 'notContains' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' | 'blank' | 'notBlank';

export interface ColumnFilterData {
  selection: string; // "(All)" or specific value
  operator: FilterOperator;
  searchValue: string;
}

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Does not equal' },
  { value: 'startsWith', label: 'Begins with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'blank', label: 'Blank' },
  { value: 'notBlank', label: 'Not blank' },
];

interface FilterProps {
  columnKey: string;
  uniqueValues: string[];
  currentFilter: ColumnFilterData;
  onFilterChange: (key: string, data: Partial<ColumnFilterData>) => void;
}

export function SelectionFilter({ columnKey, uniqueValues, currentFilter, onFilterChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isActive = currentFilter.selection !== '(All)';

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex min-w-[100px] items-center justify-between gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
          isActive 
            ? "bg-primary/20 text-primary ring-1 ring-primary/40" 
            : "bg-surface-elevated text-foreground hover:bg-surface-strong/20"
        )}
      >
        <span className="truncate">{currentFilter.selection || '(All)'}</span>
        <ChevronDown size={12} className={clsx('transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-0 top-full z-[100] mt-1 max-h-60 w-48 overflow-auto rounded-lg border border-border bg-surface p-1 shadow-2xl"
          >
            <button
              onClick={() => { onFilterChange(columnKey, { selection: '(All)' }); setIsOpen(false); }}
              className={clsx(
                "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[11px] hover:bg-foreground/5",
                currentFilter.selection === '(All)' ? "text-primary" : "text-foreground/60"
              )}
            >
              <span>(All)</span>
              {currentFilter.selection === '(All)' && <Check size={12} />}
            </button>
            {uniqueValues.map(val => (
              <button
                key={val}
                onClick={() => { onFilterChange(columnKey, { selection: val }); setIsOpen(false); }}
                className={clsx(
                  "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[11px] hover:bg-foreground/5",
                  currentFilter.selection === val ? "text-primary" : "text-foreground/60"
                )}
              >
                <span className="truncate">{val || '(Empty)'}</span>
                {currentFilter.selection === val && <Check size={12} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FloatingFilterPopup({ columnKey, currentFilter, onFilterChange }: Omit<FilterProps, 'uniqueValues'>) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempOperator, setTempOperator] = useState<FilterOperator>(currentFilter.operator);
  const [tempValue, setTempValue] = useState(currentFilter.searchValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempOperator(currentFilter.operator);
    setTempValue(currentFilter.searchValue);
  }, [currentFilter]);

  const handleApply = () => {
    onFilterChange(columnKey, { operator: tempOperator, searchValue: tempValue });
    setIsOpen(false);
  };

  const handleReset = () => {
    onFilterChange(columnKey, { operator: 'contains', searchValue: '' });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isActive = currentFilter.searchValue !== '' || currentFilter.operator === 'blank' || currentFilter.operator === 'notBlank';

  return (
    <div className="flex items-center gap-1.5" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex h-6 w-6 items-center justify-center rounded transition-colors",
          isActive ? "bg-primary/20 text-primary ring-1 ring-primary/40" : "text-foreground/40 hover:bg-foreground/5"
        )}
      >
        <Filter size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 top-full z-[110] mt-1 w-64 rounded-xl border border-border bg-surface p-4 shadow-2xl"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-white/40">Operation</label>
                <select
                  value={tempOperator}
                  onChange={(e) => setTempOperator(e.target.value as FilterOperator)}
                  className="w-full rounded-lg border border-border bg-surface-elevated/20 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-white/40">Value</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    autoFocus
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="Filter..."
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    className="w-full rounded-lg border border-border bg-surface-elevated/20 py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40 hover:bg-white/5 hover:text-white"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="rounded-lg bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
