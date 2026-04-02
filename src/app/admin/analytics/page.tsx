import {BrandCatalogCard, BreakdownCard, InsightMetricCard, LeaderboardCard, TrendCard} from "@/components/admin/analytics/InsightBlocks";
import {buildDashboardInsights} from "@/lib/admin/insights";
import {loadInsightsData} from "@/lib/admin/load-insights-data";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const dynamic = "force-dynamic";

type DashboardInsightsInput = Parameters<typeof buildDashboardInsights>[0];

const EMPTY_INSIGHTS_DATA: DashboardInsightsInput = {
  orders: [],
  products: [],
  variants: [],
  brands: [],
  users: [],
  inventoryLevels: [],
};

export default async function AnalyticsPage() {
  let data = EMPTY_INSIGHTS_DATA;
  let loadError: string | null = null;

  try {
    data = await loadInsightsData();
  } catch (error) {
    console.error("ANALYTICS_PAGE_ERROR:", error);
    loadError =
      "Analytics data could not be loaded from MongoDB. Please check the production database credentials and try again.";
  }

  const insights = buildDashboardInsights(data);

  const bestWeek =
    insights.weeklyOrderValue.reduce(
      (best, point) => (point.value > best.value ? point : best),
      insights.weeklyOrderValue[0] ?? {label: "No activity", value: 0, count: 0}
    );
  const topProduct = insights.topProducts[0];
  const topContributor = insights.topContributors[0];
  const orderCountTrend = insights.weeklyOrderValue.map((point) => ({
    label: point.label,
    value: point.count ?? 0,
  }));

  return (
    <div className="space-y-4">
      {loadError ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-100">
          {loadError}
        </section>
      ) : null}

      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="grid gap-4 border-b border-border/60 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
              Analytics
            </p>
            <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
              Revenue, product, and people insights
            </h2>
            <p className="max-w-3xl text-sm text-foreground/62">
              Use this page to compare weekly order flow, top-performing products, brand coverage, and who is driving the most value through the system.
            </p>
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/42">
              Quick insight
            </p>
            <div className="mt-3 space-y-3 text-sm text-foreground/62">
              <p>
                Best week: <span className="font-semibold text-foreground">{bestWeek.label}</span> with{" "}
                <span className="font-semibold text-foreground">{money.format(bestWeek.value)}</span>.
              </p>
              <p>
                Leading product: <span className="font-semibold text-foreground">{topProduct?.label ?? "No orders yet"}</span>.
              </p>
              <p>
                Leading contributor: <span className="font-semibold text-foreground">{topContributor?.label ?? "No assignments yet"}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightMetricCard
            label="Order value"
            value={money.format(insights.headline.totalRevenue)}
            detail="Combined value across active order records."
            accent="#2f7ff4"
          />
          <InsightMetricCard
            label="Orders in flow"
            value={String(insights.headline.totalOrders)}
            detail="Orders currently tracked in the workspace."
            accent="#606260"
          />
          <InsightMetricCard
            label="Best week"
            value={bestWeek.label}
            detail={money.format(bestWeek.value)}
            accent="#1aa661"
          />
          <InsightMetricCard
            label="Top product"
            value={topProduct ? String(topProduct.value) : "0"}
            detail={topProduct ? `${topProduct.label}` : "No ordered products yet"}
            accent="#d4a017"
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <TrendCard
          title="Weekly order value"
          description="Value trend across the last eight weeks."
          points={insights.weeklyOrderValue}
          formatter={(value) => money.format(value)}
        />
        <TrendCard
          title="Weekly order count"
          description="Volume trend across the same period."
          points={orderCountTrend}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <BreakdownCard
          title="Workflow distribution"
          description="How current orders are distributed across each stage."
          items={insights.workflowBreakdown}
        />
        <LeaderboardCard
          title="Highest selling products"
          description="Products ranked by total ordered units, with booked value underneath."
          items={insights.topProducts}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <BreakdownCard
          title="People by role"
          description="Active team structure inside the workspace."
          items={insights.roleDistribution}
        />
        <LeaderboardCard
          title="Individuals driving value"
          description="Sales reps and managers attached to the highest order value."
          items={insights.topContributors}
        />
      </div>

      <BrandCatalogCard
        title="Brand accountability"
        description="Catalog depth and available stock by brand."
        items={insights.brandCatalog}
      />
    </div>
  );
}
