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
  warehouses: [],
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
        <section className="rounded-[24px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
          {loadError}
        </section>
      ) : null}

      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="grid gap-4 border-b border-border px-4 py-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted">
              Analytics
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Revenue, product, and people insights
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted">
              Use this page to compare weekly order flow, top-performing products, brand coverage, and who is driving the most value through the system.
            </p>
          </div>

          <div className="rounded-[24px] border border-border bg-surface-muted p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Quick insight
            </p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>
                Best week: <span className="font-bold text-foreground">{bestWeek.label}</span> with{" "}
                <span className="font-bold text-foreground">{money.format(bestWeek.value)}</span>.
              </p>
              <p>
                Leading product: <span className="font-bold text-foreground">{topProduct?.label ?? "No orders yet"}</span>.
              </p>
              <p>
                Leading contributor: <span className="font-bold text-foreground">{topContributor?.label ?? "No assignments yet"}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-5 md:grid-cols-2 xl:grid-cols-4">
          <InsightMetricCard
            label="Order value"
            value={money.format(insights.headline.totalRevenue)}
            detail="Combined value across active order records."
            accent="#EEF4FF"
          />
          <InsightMetricCard
            label="Orders in flow"
            value={String(insights.headline.totalOrders)}
            detail="Orders currently tracked in the workspace."
            accent="#ECFDF5"
          />
          <InsightMetricCard
            label="Best week"
            value={bestWeek.label}
            detail={money.format(bestWeek.value)}
            accent="#FFF7E6"
          />
          <InsightMetricCard
            label="Top product"
            value={topProduct ? String(topProduct.value) : "0"}
            detail={topProduct ? `${topProduct.label}` : "No ordered products yet"}
            accent="#FFF1F2"
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
