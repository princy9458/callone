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

function toneClasses(tone?: BreakdownItem["tone"]) {
  switch (tone) {
    case "emerald":
      return "bg-foreground/10 text-foreground/86";
    case "amber":
      return "bg-foreground/10 text-foreground/86";
    case "rose":
      return "bg-foreground/10 text-foreground/86";
    case "blue":
      return "bg-foreground/10 text-foreground/86";
    default:
      return "bg-foreground/10 text-foreground/80";
  }
}

export function InsightMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  image,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: React.ElementType;
  image?: string;
  accent?: string;
}) {
  const isDarkAccent = accent && (
    accent.toLowerCase().startsWith('#00') || 
    accent.toLowerCase().startsWith('#11') || 
    accent.toLowerCase().startsWith('#0b') || 
    accent.toLowerCase().startsWith('#1a') || 
    accent.toLowerCase().startsWith('#4b')
  );
  
  const textClass = accent ? (isDarkAccent ? "text-white" : "text-black") : "text-foreground";
  const mutedClass = accent ? (isDarkAccent ? "text-white/60" : "text-black/60") : "text-muted";

  return (
    <div 
      className="group premium-card p-6"
      style={{
        backgroundColor: accent || "var(--premium-card-bg)",
        backgroundImage: accent ? 'none' : undefined,
        borderColor: accent ? "rgba(0,0,0,0.08)" : "var(--premium-card-border)"
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${mutedClass}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold tracking-tight ${textClass} sm:text-4xl`}>
            {value}
          </p>
        </div>
        {(Icon || image) && (
          <div 
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-black/5 transition duration-400 group-hover:scale-110"
            style={{ 
              backgroundColor: accent ? (isDarkAccent ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)") : "var(--control-bg)",
              color: accent ? (isDarkAccent ? "#FFFFFF" : "#000000") : "var(--foreground)"
            }}
          >
            {image ? (
              <img src={image} alt={label} className="h-full w-full object-contain p-2" />
            ) : Icon ? (
              <Icon size={20} strokeWidth={2.5} />
            ) : null}
          </div>
        )}
      </div>
      <p className={`mt-4 text-sm leading-relaxed ${mutedClass}`}>{detail}</p>
    </div>
  );
}

export function TrendCard({
  title,
  description,
  points,
  formatter = compactNumber,
}: {
  title: string;
  description: string;
  points: TrendPoint[];
  formatter?: (value: number) => string;
}) {
  if (!points || points.length === 0) {
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
        <svg viewBox="0 0 100 76" className="h-52 w-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

          <div className="mt-3 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
            {points.map((point) => (
            <div key={point.label} className="rounded-xl border border-border bg-surface-muted/50 px-3 py-2 text-center">
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
}: {
  title: string;
  description: string;
  items: BreakdownItem[];
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="premium-card rounded-[28px] p-6">
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/62">{description}</p>

      <div className="mt-5 space-y-3">
        {items.length ? (
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
              <div className="mt-2.5 h-1.5 rounded-full bg-foreground/5">
                <div
                  className={`h-1.5 rounded-full ${item.tone ? "bg-primary" : "bg-muted/30"}`}
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
  valuePrefix = "",
  showCurrency = false,
}: {
  title: string;
  description: string;
  items: LeaderboardItem[];
  valuePrefix?: string;
  showCurrency?: boolean;
}) {
  return (
    <div className="premium-card rounded-[28px] p-6">
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/62">{description}</p>

      <div className="mt-5 space-y-3">
        {items.length ? (
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
}: {
  title: string;
  description: string;
  items: BrandCatalogInsight[];
}) {
  return (
    <div className="premium-card rounded-[28px] p-6">
      <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground/62">{description}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-surface p-4 transition duration-300 hover:bg-surface-muted">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">{item.label}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{item.products}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{item.variants}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted">SKUs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{item.stock}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Stock</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/70 bg-[color:var(--surface-muted)] px-4 py-6 text-sm text-foreground/62">
            No catalog groups available yet.
          </div>
        )}
      </div>
    </div>
  );
}
