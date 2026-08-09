'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, FileText, FolderKanban,
  Zap, BarChart3, Settings, Image as ImageIcon, Globe, LogOut,
  GitCompare, Tag, Sparkles, MessageSquare, Users, Mail, Link2,
  Tv, ShieldCheck, Database, HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface Counts {
  products?: number;
  blogs?: number;
  pendingComments?: number;
  users?: number;
  newsletterSubscribers?: number;
  categories?: number;
  brands?: number;
  deals?: number;
  comparisons?: number;
}

export default function AdminSidebar({ isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState<Counts>({});

  useEffect(() => {
    fetch('/api/admin/counts')
      .then((res) => res.json())
      .then((data) => setCounts(data))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag, count: counts.products },
    { name: 'Reviews', href: '/admin/blogs', icon: FileText },
    { name: 'Comparisons', href: '/admin/comparisons', icon: GitCompare, count: counts.comparisons },
    { name: 'Categories', href: '/admin/categories', icon: FolderKanban, count: counts.categories },
    { name: 'Brands', href: '/admin/brands', icon: Tag, count: counts.brands },
    { name: 'Deals', href: '/admin/deals', icon: Sparkles, badge: 'Hot', count: counts.deals },
    { name: 'Amazon Generator', href: '/admin/automation', icon: Zap, badge: 'AI' },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText, count: counts.blogs },
    { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { name: 'Comments', href: '/admin/comments', icon: MessageSquare, count: counts.pendingComments },
    { name: 'Users', href: '/admin/users', icon: Users, count: counts.users },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Mail, count: counts.newsletterSubscribers },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Affiliate Links', href: '/admin/affiliate-links', icon: Link2 },
    { name: 'Advertisements', href: '/admin/advertisements', icon: Tv },
    { name: 'SEO', href: '/admin/seo', icon: ShieldCheck },
    { name: 'Backup', href: '/admin/backup', icon: Database },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Support', href: '/admin/support', icon: HelpCircle },
  ];

  return (
    <aside
      className={`bg-neutral-900 dark:bg-neutral-950 text-neutral-300 min-h-screen p-3 flex flex-col justify-between shrink-0 border-r border-neutral-800 transition-all duration-300 select-none ${
        isCollapsed
          ? 'hidden md:flex md:w-20'
          : 'fixed md:relative inset-y-0 left-0 z-50 w-64 shadow-2xl md:shadow-none'
      }`}
    >
      <div>
        {/* Brand & Collapse Switcher */}
        <div className="flex items-center justify-between px-3 py-3 mb-4 border-b border-neutral-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-sm">
              T
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-extrabold text-white text-sm tracking-tight leading-tight">
                  TechPulse
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">
                  Admin Dashboard
                </div>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white font-extrabold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1">
                    {item.count !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-neutral-800 text-neutral-300">
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-neutral-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title={isCollapsed ? 'View Live Website' : undefined}
        >
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          {!isCollapsed && <span>View Live Site</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors text-left"
          title={isCollapsed ? 'Logout Session' : undefined}
        >
          <LogOut className="w-4 h-4 text-neutral-400 shrink-0" />
          {!isCollapsed && <span>Logout Session</span>}
        </button>
      </div>
    </aside>
  );
}
