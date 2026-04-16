"use client";

import React, { useEffect, useState } from "react";
import {
  BrandCatalogCard,
  BreakdownCard,
  InsightMetricCard,
  LeaderboardCard,
  TrendCard,
  SkeletonLoader,
} from "@/components/admin/analytics/InsightBlocks";
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Warehouse,
  ClipboardCheck,
} from "lucide-react";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard intelligence");
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error("DASHBOARD_FETCH_ERROR:", err);
        setError(err.message || "An error occurred while connecting to analytics service.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="flex flex-col gap-2 px-1">
            <div className="h-4 w-32 animate-pulse rounded bg-muted/10"></div>
            <div className="h-10 w-64 animate-pulse rounded bg-muted/20"></div>
         </div>
         <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
        <div className="max-w-md rounded-[32px] border border-red-500/10 bg-red-500/5 p-10 shadow-2xl backdrop-blur-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-600">
             <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Connection Outage</h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 w-full rounded-2xl bg-foreground px-8 py-4 text-xs font-black uppercase tracking-widest text-background transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
          >
            Reconnect to Database
          </button>
        </div>
      </div>
    );
  }

  if (!data || (!data.brandCoverage?.length && !data.topProducts?.length)) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
        <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-foreground/[0.03] text-4xl grayscale opacity-40">
           📦
        </div>
        <h2 className="mt-8 text-2xl font-black tracking-tight text-foreground">Intelligence Dormant</h2>
        <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-muted">The analytics processing engine is waiting for transaction data to arrive.</p>
      </div>
    );
  }

  // Map API data to component formats
  const brandCatalog = (data.brandCoverage || []).map((b: any) => ({
    label: b.brand,
    products: b.items,
    variants: b.skus,
    stock: b.stock,
  }));

  const topProducts = (data.topProducts || []).map((p: any) => ({
    label: p.sku,
    sublabel: p.brand || "Brand not tagged",
    value: p.orders,
    secondary: p.value,
  }));

  const headlineMetrics = data.headline || {
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    availableUnits: 0,
    pendingApprovals: 0,
    averageOrderValue: 0,
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-6 px-1 pt-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
              Live intelligence
            </p>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Performance Matrix
            </h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <InsightMetricCard
            label="Travis Mathew"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("travis"))?.products || 0)}
            detail="Active products in TM catalog."
            accent="var(--accent-blue)"
            image={"https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/tm_thum_23fdeb8c29.png"}
          />
          <InsightMetricCard
            label="Ogio"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("ogio"))?.products || 0)}
            detail="Available premium backpacks."
            accent="var(--accent-yellow)"
            image="https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/ogio_favicon_ac591c347e_8de0fee6f4.png"
          />
          <InsightMetricCard
            label="Callaway Soft"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("softgoods"))?.products || 0)}
            detail="Active softgoods items."
            accent="var(--accent-green)"
            image="https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/icon_callway_f25555115b.png"
          />
          <InsightMetricCard
            label="Callaway Hard"
            value={String(brandCatalog.find((b: any) => b.label?.toLowerCase().includes("hardgoods"))?.products || 0)}
            detail="High performance equipment."
            accent="var(--accent-pink)"
            image="https://callawaytech.s3.ap-south-1.amazonaws.com/omsimages/uploads/icon_callway_f25555115b.png"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <InsightMetricCard
            label="Order value"
            value={money.format(headlineMetrics.totalRevenue)}
            detail={`${headlineMetrics.totalOrders} live orders.`}
            accent="var(--accent-blue)"
            icon={CreditCard}
          />
          <InsightMetricCard
            label="Active items"
            value={String(headlineMetrics.activeProducts)}
            detail="Total sellable catalog."
            accent="var(--accent-green)"
            icon={ShoppingBag}
          />
          <InsightMetricCard
            label="Total stock"
            value={String(headlineMetrics.availableUnits)}
            detail="Units in fulfillment hubs."
            accent="var(--accent-yellow)"
            icon={Warehouse}
          />
          <InsightMetricCard
            label="Approvals"
            value={String(headlineMetrics.pendingApprovals)}
            detail="Orders awaiting review."
            accent="var(--accent-pink)"
            icon={ClipboardCheck}
          />
          <InsightMetricCard
            label="Avg ticket"
            value={money.format(headlineMetrics.averageOrderValue)}
            detail="Value per active order."
            accent="var(--accent-grey)"
            icon={TrendingUp}
          />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <TrendCard
          title="Weekly Revenue Flow"
          description="Gross order value movement across the last trailing 8 weeks."
          points={data.weeklyOrderValue || []}
          formatter={(value) => money.format(value)}
        />
        <BreakdownCard
          title="Workflow Pipeline"
          description="Distribution of orders by their current processing stage."
          items={data.workflowBreakdown || []}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <BrandCatalogCard
          title="Brand Intelligence"
          description="High-level catalog footprint and real-time inventory depth per brand."
          items={brandCatalog}
        />
        <LeaderboardCard
          title="Product Velocity"
          description="Performance ranking of items based on unit demand and contribution."
          items={topProducts}
          valuePrefix=""
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <BreakdownCard
          title="Hub Distribution"
          description="Regional inventory availability across active fulfillment centers."
          items={data.warehouseBreakdown || []}
        />
        <BreakdownCard
          title="Role Utilization"
          description="Personnel bandwidth and active account distribution."
          items={data.roleDistribution || []}
        />
        <LeaderboardCard
          title="Peak Performers"
          description="Individual contributors driving the highest revenue results."
          items={data.topContributors || []}
          valuePrefix=""
        />
      </div>
    </div>
  );
}
