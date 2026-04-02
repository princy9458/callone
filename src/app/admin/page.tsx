
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

export default async function AdminDashboardPage() {
  let data = EMPTY_INSIGHTS_DATA;
  let loadError: string | null = null;

  try {
    data = await loadInsightsData();
  } catch (error) {
    console.error("ADMIN_DASHBOARD_ERROR:", error);
    loadError =
      "Dashboard data could not be loaded from MongoDB. Please check the production database credentials and try again.";
  }

  const insights = buildDashboardInsights(data);

  return (
    <div className="space-y-4">
      {loadError ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-100">
          {loadError}
        </section>
      ) : null}

      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-4 py-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
              Daily overview
            </p>
            <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
              Performance at a glance
            </h2>
            <p className="max-w-3xl text-sm text-foreground/62">
              Follow order movement, product readiness, available stock, and team activity from one clear starting point.
            </p>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 md:grid-cols-2 xl:grid-cols-5">
          <InsightMetricCard
            label="Order value"
            value={money.format(insights.headline.totalRevenue)}
            detail={`${insights.headline.totalOrders} live orders tracked across the workspace.`}
            accent="#2f7ff4"
          />
          <InsightMetricCard
            label="Active products"
            value={String(insights.headline.activeProducts)}
            detail="Products currently available to sales and admin teams."
            accent="#606260"
          />
          <InsightMetricCard
            label="Available units"
            value={String(insights.headline.availableUnits)}
            detail="Stock ready to allocate across active warehouse locations."
            accent="#1aa661"
          />
          <InsightMetricCard
            label="Pending approvals"
            value={String(insights.headline.pendingApprovals)}
            detail="Orders waiting on availability review or approval."
            accent="#d4a017"
          />
          <InsightMetricCard
            label="Average order"
            value={money.format(insights.headline.averageOrderValue)}
            detail="Average value per active order in the current system."
            accent="#949797"
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <TrendCard
          title="Weekly order movement"
          description="Order value and activity across the last eight weeks."
          points={insights.weeklyOrderValue}
          formatter={(value) => money.format(value)}
        />
        <BreakdownCard
          title="Workflow focus"
          description="Where orders are currently sitting in the process."
          items={insights.workflowBreakdown}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <BrandCatalogCard
          title="Brand coverage"
          description="Current catalog footprint by brand, including variants and available stock."
          items={insights.brandCatalog}
        />
        <LeaderboardCard
          title="Top ordered products"
          description="Most requested items by unit count, with value underneath."
          items={insights.topProducts}
          valuePrefix=""
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <BreakdownCard
          title="Team distribution"
          description="Current active users by responsibility."
          items={insights.roleDistribution}
        />
        <LeaderboardCard
          title="Leading people"
          description="Team members attached to the highest order value in the system."
          items={insights.topContributors}
          valuePrefix=""
        />
      </div>
    </div>
  );
}
