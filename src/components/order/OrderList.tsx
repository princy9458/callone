
"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { OrderRow } from "./OrderRow";
import { Search, Filter, ChevronRight, ChevronLeft, Users as UsersIcon, CheckCircle2, Clock } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "pending" | "completed" | "users";

export const OrderList = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const { allOrders, isLoadingOrders } = useSelector((state: RootState) => state.order);
  const { allRetailer, allManager } = useSelector((state: RootState) => state.user);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const statusMatch = activeTab === "pending" 
        ? order.status !== "complete-order" 
        : activeTab === "completed" 
          ? order.status === "complete-order"
          : true; // "users" tab might have different logic or just show all

      const query = searchQuery.toLowerCase();
      const searchMatch = !query || 
        (order.id?.toString().includes(query)) ||
        (order.orderNumber?.toLowerCase().includes(query)) ||
        (order.retailer_id?.toLowerCase().includes(query));

      return statusMatch && searchMatch;
    });
  }, [allOrders, activeTab, searchQuery]);

  // Pagination logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const tabs = [
    { id: "pending", label: "Pending Orders", icon: Clock },
    { id: "completed", label: "Completed Orders", icon: CheckCircle2 },
    { id: "users", label: "Users", icon: UsersIcon },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Command Hub Navigation */}
      <div className="flex w-fit items-center rounded-[20px] border border-border/40 bg-[#111111]/[0.02] p-1.5 shadow-sm backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={clsx(
                "group relative flex items-center gap-2.5 rounded-[14px] px-6 py-3 transition-all duration-300 active:scale-[0.96]",
                isActive ? "text-white" : "text-[#111111]/40 hover:text-[#111111]/60"
              )}
            >
              {/* Sliding Active Pod */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPod"
                  className="absolute inset-0 z-0 rounded-[14px] bg-[#111111] shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <Icon 
                size={16} 
                className={clsx(
                  "relative z-10 transition-colors duration-300",
                  isActive ? "text-primary" : "text-[#111111]/20 group-hover:text-[#111111]/40"
                )} 
              />
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.15em]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white dark:bg-[#111111] shadow-[0_15px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_45px_100px_rgba(0,0,0,0.4)] transition-all duration-500">
        {/* Header / Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 bg-foreground/[0.01] px-8 py-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="h-6 w-px bg-border/40" />
            <span className="rounded-full bg-foreground/[0.05] border border-border/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
              {totalItems} total items
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 transition-colors group-focus-within:text-primary" size={16} />
              <input
                type="text"
                placeholder="Search by ID or Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-64 rounded-2xl border border-border/40 bg-foreground/[0.02] pl-12 pr-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary/40 focus:bg-white dark:focus:bg-white/5 placeholder:text-foreground/20"
              />
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/40 transition-all hover:bg-primary hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={clsx(
                        "h-8 w-8 rounded-lg text-xs font-black transition-all",
                        currentPage === p 
                          ? "bg-[#111111] dark:bg-primary text-white" 
                          : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/40 transition-all hover:bg-primary hover:text-white disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              
              <div className="relative ml-2">
                <select 
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-10 rounded-xl border border-border/40 bg-foreground/[0.02] px-3 pr-8 text-[10px] font-black uppercase tracking-widest text-foreground/60 outline-none hover:bg-foreground/5 cursor-pointer appearance-none"
                >
                  <option value={25}>25 Items</option>
                  <option value={50}>50 Items</option>
                  <option value={100}>100 Items</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/20">
                   <ChevronRight size={12} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="relative overflow-x-auto">
          {activeTab === "users" ? (
            <table className="w-full text-left ">
              <thead>
                <tr className="border-b border-border/40 bg-foreground/[0.01] bg-[#111111] text-white">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Name</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Email</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Phone</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {[...allRetailer, ...allManager].map((user) => (
                  <tr key={user._id || user.id} className="group hover:bg-foreground/[0.02] transition-all">
                    <td className="px-6 py-4 text-sm font-black text-foreground/80">{user.name}</td>
                    <td className="px-6 py-4 lowercase">
                      <span className="inline-flex rounded-lg border border-border/40 bg-foreground/[0.03] px-2.5 py-1 text-[10px] font-black text-foreground/40 first-letter:uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground/60">{user.email || "—"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground/60">{user.phone || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors">
                        Inspect Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              
              <thead>
                <tr className="border-b border-border/40 bg-foreground/[0.01] bg-[#111111] text-white">
                  <th className="px-6 py-5"></th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Order Id</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Retailer Name</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Order Date</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Last Update</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Discount</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Amount</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Status</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {isLoadingOrders ? (
                  <tr>
                    <td colSpan={9} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Syncing database...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <OrderRow 
                      key={order._id || order.id?.toString()} 
                      order={order} 
                      retailers={allRetailer}
                      managers={allManager}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Clock size={48} className="text-foreground/5" />
                        <div className="space-y-1">
                          <p className="text-lg font-black text-foreground/20 uppercase tracking-[0.1em]">No records identified</p>
                          <p className="text-[10px] text-foreground/10 font-black uppercase tracking-widest">Adjust filters to re-scan</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
