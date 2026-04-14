'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

interface PremiumSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export const PremiumSelect: React.FC<PremiumSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  icon,
  searchable = false,
  disabled = false,
  className,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, searchable]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={clsx('relative w-full', className)} ref={containerRef}>
      {label && (
        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          'flex h-[44px] w-full items-center justify-between rounded-xl border transition-all duration-300 outline-none',
          'px-5 py-3 text-[13px] font-bold text-foreground',
          isOpen 
            ? 'border-primary bg-surface shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' 
            : 'border-border bg-surface-muted/30 backdrop-blur-sm hover:border-primary/50 hover:bg-surface-muted/50',
          disabled && 'opacity-50 cursor-not-allowed',
          triggerClassName
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && <div className={clsx("shrink-0 transition-colors duration-300", isOpen ? "text-primary" : "text-muted-foreground/40")}>{icon}</div>}
          <span className={clsx('truncate transition-colors duration-300', !selectedOption && 'text-muted-foreground/30')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <motion.div 
              layoutId="focus-bar"
              className="h-4 w-[2px] rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            />
          )}
          <ChevronDown 
            size={16} 
            className={clsx('shrink-0 text-muted-foreground/20 transition-all duration-300', isOpen && 'rotate-180 text-primary')} 
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-border/40 bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl w-60"
          >
            {searchable && (
              <div className="border-b border-white/[0.05] p-3">
                <div className="relative flex items-center rounded-xl bg-white/[0.03] px-4 py-2.5 transition-colors focus-within:bg-white/[0.06]">
                  <Search size={14} className="mr-3 text-white/20" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Quick search..."
                    className="w-full bg-transparent text-[12px] font-medium text-white outline-none placeholder:text-white/10"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="ml-2 text-white/20 hover:text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={clsx('max-h-[320px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10')}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={clsx(
                      'group relative flex w-full flex-col items-start rounded-xl px-4 py-3 text-left transition-all',
                      value === option.value ? 'bg-primary/10 text-primary' : 'text-white/60 hover:bg-white/[0.03] hover:text-white'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-[12px] font-black uppercase tracking-wide">{option.label}</span>
                      {value === option.value && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check size={14} strokeWidth={3} className="text-primary" />
                        </motion.div>
                      )}
                    </div>
                    {option.subLabel && (
                      <span className={clsx(
                        'mt-1 text-[10px] font-bold uppercase tracking-widest transition-colors',
                        value === option.value ? 'text-primary/60' : 'text-white/20 group-hover:text-white/30'
                      )}>
                        {option.subLabel}
                      </span>
                    )}
                    {value === option.value && (
                      <motion.div 
                        layoutId="active-item-indicator"
                        className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-primary rounded-r-full"
                      />
                    )}
                  </button>
                ))
              ) : (
                <div className="py-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/10">
                  No Database Records
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
