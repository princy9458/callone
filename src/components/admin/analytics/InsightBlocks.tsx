"use client";

import React from "react";
import type {BreakdownItem, BrandCatalogInsight, LeaderboardItem, TrendPoint} from "@/lib/admin/insights";

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function InsightMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  image,
  accent,
  isLoading,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: React.ElementType;
  image?: string;
  accent?: string;
  isLoading?: boolean;
}) {
  // Use dark text for all colored (pastel) cards as per user reference
  const textClass = accent ? "text-[#0B0B0B]" : "text-foreground";
  const mutedClass = accent ? "text-[#0B0B0B]/60" : "text-muted";

  return (
    <div 
      className="group premium-card p-6 relative overflow-hidden"
      style={{
        backgroundColor: accent || "var(--premium-card-bg)",
        backgroundImage: accent ? 'none' : undefined,
      }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${mutedClass}`}>
            {label}
          </p>
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-black/10 mt-1" />
          ) : (
            <p className={`text-3xl font-black tracking-tight ${textClass} sm:text-4xl`}>
              {value}
            </p>
          )}
        </div>
        {(Icon || image || isLoading) && (
          <div 
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-black/5 transition duration-500 group-hover:scale-110 bg-white/40"
            style={{ 
              color: accent ? "rgba(0,0,0,0.8)" : "var(--foreground)"
            }}
          >
            {isLoading ? (
               <div className="h-5 w-5 animate-pulse rounded bg-black/10" />
            ) : image ? (
              <img src={image} alt={label} className="h-full w-full object-contain p-2" />
            ) : Icon ? (
              <Icon size={20} strokeWidth={2.5} />
            ) : null}
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="mt-4 h-3 w-32 animate-pulse rounded bg-black/5 relative z-10" />
      ) : (
        <p className={`mt-4 text-xs font-medium leading-relaxed opacity-80 relative z-10 ${mutedClass}`}>{detail}</p>
      )}
    </div>
  );
}

export function TrendCard({
  title,
  description,
  points,
  isLoading,
  formatter = compactNumber,
}: {
  title: string;
  description: string;
  points: TrendPoint[];
  isLoading?: boolean;
  formatter?: (value: number) => string;
}) {
  if (!isLoading && (!points || points.length === 0)) {
    return (
      <div className="premium-card rounded-[28px] p-6">
        <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
        <div className="mt-8 flex h-52 items-center justify-center rounded-[24px] border border-dashed border-border/20 bg-surface-muted/30">
          <p className="text-sm text-muted">No data available for this period.</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...points.map((point) => point.value || 0), 1);
  const stepX = points.length > 1 ? 100 / (points.length - 1) : 100;

  const generateSmoothPath = (pts: TrendPoint[]) => {
    if (!pts || pts.length < 2) return "";
    return pts.reduce((acc, pt, i) => {
      const x = i * stepX;
      const y = 72 - ((pt.value || 0) / maxValue) * 62;
      if (i === 0) return `M 0,${y}`;
      const px = (i - 1) * stepX;
      const py = 72 - ((pts[i - 1].value || 0) / maxValue) * 62;
      return `${acc} C ${(px + x) / 2},${py} ${(px + x) / 2},${y} ${x},${y}`;
    }, "");
  };

  const linePath = generateSmoothPath(points);
  const areaPath = linePath ? `${linePath} L 100,72 L 0,72 Z` : "";
  const gradientId = `trend-fill-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="premium-card rounded-[28px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
          <p className="mt-1 text-sm text-foreground/62">{description}</p>
        </div>
        <div className="rounded-full border border-border/20 bg-foreground/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/52">
          Last {points.length} weeks
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-border/12 bg-surface-muted/30 p-5">
        {isLoading ? (
          <div className="h-52 w-full animate-pulse bg-muted/10 rounded-xl" />
        ) : points.length > 0 ? (
          <svg viewBox="0 0 100 76" className="h-52 w-full">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke="#2DD4BF"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        ) : (
           <div className="flex h-52 items-center justify-center">
             <p className="text-sm text-muted">No data available</p>
           </div>
        )}

        <div className="mt-3 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-muted/20" />
            ))
          ) : points.map((point) => (
            <div key={point.label} className="rounded-xl border border-border bg-surface-muted/50 px-3 py-2 text-center transition-all hover:bg-surface-elevated">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {point.label}
              </p>
              <p className="mt-1 text-base font-bold text-foreground">
                {formatter ? formatter(point.value) : point.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BreakdownCard({
  title,
  description,
  items,
  isLoading,
}: {
  title: string;
  description: string;
  items: BreakdownItem[];
  isLoading?: boolean;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="premium-card rounded-[28px] p-6">
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/62">{description}</p>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/20" />
          ))
        ) : items.length ? (
          items.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-surface px-4 py-3 transition duration-300 hover:bg-surface-muted">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">{item.label}</p>
                </div>
                <span className="text-base font-bold text-foreground">
                  {item.value}
                </span>
              </div>
              <div className="mt-2.5 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2DD4BF] transition-all duration-1000"
                  style={{width: `${(item.value / maxValue) * 100}%`}}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/10 bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-foreground/62">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function LeaderboardCard({
  title,
  description,
  items,
  isLoading,
  valuePrefix = "",
  showCurrency = false,
}: {
  title: string;
  description: string;
  items: LeaderboardItem[];
  isLoading?: boolean;
  valuePrefix?: string;
  showCurrency?: boolean;
}) {
  return (
    <div className="premium-card rounded-[28px] p-6">
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/62">{description}</p>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/20" />
          ))
        ) : items.length ? (
          items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-xl border border-border bg-surface px-4 py-4 transition duration-300 hover:bg-surface-muted">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold uppercase tracking-wider text-muted">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{item.sublabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-foreground">
                    {showCurrency ? currency(item.value) : `${valuePrefix}${compactNumber(item.value)}`}
                  </p>
                  {item.secondary != null ? (
                    <p className="mt-1 text-xs text-muted">{currency(item.secondary)}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/70 bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-foreground/62">
            No ranked data available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function BrandCatalogCard({
  title,
  description,
  items,
  isLoading,
}: {
  title: string;
  description: string;
  items: BrandCatalogInsight[];
  isLoading?: boolean;
}) {
  return (
    <div className="premium-card rounded-[28px] p-6">
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/62">{description}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/20" />
          ))
        ) : items.length ? (
          items.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-surface p-4 transition duration-300 hover:bg-surface-muted">
              <p className="text-xs font-bold uppercase tracking-wider text-muted pb-3 border-b border-border/10 mb-4">{item.label}</p>
              <div className="grid grid-cols-3 gap-0 text-center">
                <div className="px-1">
                  <p className="text-base font-black tracking-tighter text-foreground sm:text-lg">{item.products}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted/60 mt-0.5">Items</p>
                </div>
                <div className="px-1 border-x border-border/10">
                  <p className="text-base font-black tracking-tighter text-foreground sm:text-lg">{item.variants}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted/60 mt-0.5">SKUs</p>
                </div>
                <div className="px-1">
                  <p className="text-base font-black tracking-tighter text-foreground sm:text-lg">{item.stock}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted/60 mt-0.5">Stock</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/70 bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-foreground/62 col-span-2">
            No catalog groups available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="premium-card h-44 animate-pulse p-7">
            <div className="mb-4 h-4 w-1/3 rounded bg-muted/10"></div>
            <div className="mb-6 h-10 w-1/2 rounded bg-muted/20"></div>
            <div className="h-4 w-full rounded bg-muted/10"></div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="premium-card h-80 animate-pulse p-8"></div>
        <div className="premium-card h-80 animate-pulse p-8"></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="premium-card h-96 animate-pulse p-8"></div>
        <div className="premium-card h-96 animate-pulse p-8"></div>
      </div>
    </div>
  );
}
