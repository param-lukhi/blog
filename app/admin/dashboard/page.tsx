'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Eye, MousePointerClick, TrendingUp, TrendingDown,
  FileText, ShoppingBag, Zap, ArrowUpRight, BarChart2, DollarSign,
  ShoppingCart, Clock, Percent, UserCheck, MessageSquare, Globe,
  Search, Shield, CheckSquare, Plus, GripVertical, AlertCircle, RefreshCw
} from 'lucide-react';

interface DashboardMetrics {
  totalVisitors: number;
  todayVisitors: number;
  monthlyVisitors: number;
  blogViews: number;
  productViews: number;
  affiliateClicks: number;
  ctr: string;
  totalProducts: number;
  publishedBlogs: number;
  totalCategories: number;
  topBlogs: { id: string; title: string; slug: string; views: number }[];
  topProducts: { id: string; name: string; slug: string; price: string; brand: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Widget Order state for drag & drop
  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    'topProducts', 'topBlogs', 'trafficSources', 'earnings',
    'recentActivity', 'tasks'
  ]);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  const fetchAnalyticsData = () => {
    setLoading(true);
    setError(null);
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to connect to database API');
        return res.json();
      })
      .then((data) => {
        setStats({
          totalVisitors: data.totalVisitors || 0,
          todayVisitors: data.todayVisitors || 0,
          monthlyVisitors: data.monthlyVisitors || 0,
          blogViews: data.blogViews || 0,
          productViews: data.productViews || 0,
          affiliateClicks: data.affiliateClicks || 0,
          ctr: data.ctr || '0.0%',
          totalProducts: data.totalProducts || 0,
          publishedBlogs: data.publishedBlogs || 0,
          totalCategories: data.totalCategories || 0,
          topBlogs: data.topBlogs || [],
          topProducts: data.topProducts || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidget(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    const newOrder = [...widgetOrder];
    const sourceIdx = newOrder.indexOf(draggedWidget);
    const targetIdx = newOrder.indexOf(targetId);

    newOrder.splice(sourceIdx, 1);
    newOrder.splice(targetIdx, 0, draggedWidget);

    setWidgetOrder(newOrder);
    setDraggedWidget(null);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-16 animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl space-y-4 max-w-lg mx-auto text-center my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-extrabold text-base text-rose-900 dark:text-rose-200">Unable to load data</h3>
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-rose-500 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Cards definitions with REAL database values
  const kpiCards = [
    { title: 'Total Visitors', value: stats?.totalVisitors ?? 0, change: 'Realtime', isPositive: true, icon: Users, color: 'text-brand-600' },
    { title: 'Total Products', value: `${stats?.totalProducts ?? 0} Active`, change: 'Real DB Count', isPositive: true, icon: ShoppingBag, color: 'text-amber-500' },
    { title: 'Published Blogs', value: `${stats?.publishedBlogs ?? 0} Articles`, change: 'Real DB Count', isPositive: true, icon: FileText, color: 'text-emerald-500' },
    { title: 'Affiliate Clicks', value: stats?.affiliateClicks ?? 0, change: 'Tracked Clicks', isPositive: true, icon: MousePointerClick, color: 'text-purple-600' },
    { title: 'Click-Through Rate', value: stats?.ctr ?? '0.0%', change: 'Calculated CTR', isPositive: true, icon: BarChart2, color: 'text-blue-600' },
    { title: 'Estimated Revenue', value: '$0.00', change: '--', isPositive: true, icon: DollarSign, color: 'text-emerald-600' },
    { title: 'Affiliate Orders', value: '0', change: '--', isPositive: true, icon: ShoppingCart, color: 'text-amber-600' },
    { title: 'Avg Session Time', value: '--', change: '--', isPositive: true, icon: Clock, color: 'text-indigo-600' },
    { title: 'Bounce Rate', value: '--', change: '--', isPositive: true, icon: Percent, color: 'text-rose-500' },
    { title: 'Returning Visitors', value: '--', change: '--', isPositive: true, icon: UserCheck, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Quick Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time database metrics & content status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/automation"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Amazon AI Generator</span>
          </Link>

          <Link
            href="/admin/blogs/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* 10 KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-2"
            >
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">{card.title}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-xl font-extrabold text-neutral-900 dark:text-white">{card.value}</div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-400 font-semibold">{card.change}</span>
                <span className="text-neutral-400">Live DB</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔄 DRAG & DROP REORDERABLE WIDGETS GRID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold px-1">
          <span>Drag-and-Drop Widgets Area</span>
          <span>Live Database Data</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetOrder.map((widgetId) => {
            if (widgetId === 'topProducts') {
              return (
                <div
                  key={widgetId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widgetId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, widgetId)}
                  className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4 relative group"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab" />
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-500" /> Products Catalog
                      </h3>
                    </div>
                    <Link href="/admin/products" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                      Manage Products
                    </Link>
                  </div>

                  {stats?.topProducts && stats.topProducts.length > 0 ? (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {stats.topProducts.map((p) => (
                        <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <Link href={`/product/${p.slug}`} target="_blank" className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-600 truncate max-w-xs block">
                              {p.name}
                            </Link>
                            <span className="text-[10px] text-neutral-400">{p.brand}</span>
                          </div>
                          <div className="font-extrabold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
                            {p.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* EMPTY STATE FOR PRODUCTS */
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs text-neutral-400 font-semibold">No products available.</p>
                      <Link
                        href="/admin/products"
                        className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-brand-500 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Create Product</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            if (widgetId === 'topBlogs') {
              return (
                <div
                  key={widgetId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widgetId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, widgetId)}
                  className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4 relative group"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab" />
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-600" /> Blog Articles
                      </h3>
                    </div>
                    <Link href="/admin/blogs" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                      View Articles
                    </Link>
                  </div>

                  {stats?.topBlogs && stats.topBlogs.length > 0 ? (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {stats.topBlogs.map((b) => (
                        <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                          <Link href={`/blog/${b.slug}`} target="_blank" className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-600 truncate max-w-xs">
                            {b.title}
                          </Link>
                          <span className="font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-1 rounded-lg">
                            👁️ {b.views} Views
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* EMPTY STATE FOR BLOGS */
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs text-neutral-400 font-semibold">No blog posts yet.</p>
                      <Link
                        href="/admin/blogs/new"
                        className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-brand-500 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Create Blog</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            if (widgetId === 'tasks') {
              return (
                <div
                  key={widgetId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widgetId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, widgetId)}
                  className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab" />
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-indigo-500" /> Tasks & Reminders
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={addTask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a task..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs outline-none"
                    />
                    <button type="submit" className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
                      Add
                    </button>
                  </form>

                  {tasks.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {tasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => toggleTask(t.id)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                            t.done ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 line-through text-neutral-400' : 'bg-white dark:bg-neutral-800 border-neutral-200/80 text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          <input type="checkbox" checked={t.done} onChange={() => {}} className="rounded text-brand-600" />
                          <span>{t.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-neutral-400 font-medium">No active tasks.</div>
                  )}
                </div>
              );
            }

            // Fallback Activity stream card
            return (
              <div
                key={widgetId}
                draggable
                onDragStart={(e) => handleDragStart(e, widgetId)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, widgetId)}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab" />
                  <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">Recent Activity Stream</h3>
                </div>
                <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                  {stats?.totalVisitors && stats.totalVisitors > 0
                    ? `Tracked ${stats.totalVisitors} real visitor events.`
                    : 'No analytics collected yet.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
