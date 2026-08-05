'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Bell, Plus, Moon, Sun, Shield, LogOut, User, Settings,
  Key, CreditCard, ChevronDown, Check, Sparkles, ExternalLink, Globe
} from 'lucide-react';
import CountrySelector from './CountrySelector';
import WishlistButton from './WishlistButton';
import ThemeToggle from './ThemeToggle';

interface AdminNavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function AdminNavbar({ isSidebarCollapsed, onToggleSidebar }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Close dropdowns on outside click or esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsQuickCreateOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/admin/login');
  };

  const mockNotifications = [
    { id: '1', title: 'New Amazon Affiliate Click', desc: 'Visitor clicked iPhone 15 Pro deal', time: '2m ago', unread: true },
    { id: '2', title: 'Blog Post Published', desc: 'Sony XM5 review auto-scheduled', time: '1h ago', unread: true },
    { id: '3', title: 'Database Backup Completed', desc: 'Automatic daily snapshot saved', time: '4h ago', unread: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-8 h-16 flex items-center justify-between gap-4 transition-all">
        
        {/* Left: Sidebar Collapse Toggle & Global Search Launcher */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Trigger */}
          <div className="relative w-full">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-xl text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all text-left"
            >
              <span className="truncate">Search products, blogs, categories, settings...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-400 bg-white dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">
                ⌘K
              </kbd>
            </button>
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Right: Controls & Quick Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick Create (+) */}
          <div className="relative">
            <button
              onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Create</span>
            </button>

            {isQuickCreateOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                <Link
                  href="/admin/blogs/new"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>New Blog Article</span>
                </Link>
                <Link
                  href="/admin/products"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Add Product</span>
                </Link>
                <Link
                  href="/admin/automation"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Amazon AI Generator</span>
                </Link>
              </div>
            )}
          </div>

          {/* Country Selector */}
          <CountrySelector />

          {/* Wishlist Icon */}
          <WishlistButton />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs">Admin Notifications</h4>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">3 New</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Public Site */}
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hidden md:block"
            title="Open Live Public Website"
          >
            <Globe className="w-4 h-4 text-emerald-500" />
          </Link>

          {/* Admin Profile Dropdown */}
          <div className="relative pl-2 border-l border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                AD
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="font-extrabold text-xs text-neutral-900 dark:text-white">Param Lukhi</div>
                  <div className="text-[11px] text-neutral-400">lukhiparam904@gmail.com</div>
                </div>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Edit Profile</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-neutral-400" />
                  <span>API Keys & Credentials</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Amazon Tag Settings</span>
                </Link>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-xl w-full p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search admin dashboard (products, blogs, settings)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-[10px] font-extrabold uppercase text-neutral-400 px-2">Quick Navigation Shortcuts</div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/admin/blogs"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-600 transition-colors flex items-center justify-between"
                >
                  <span>Blogs & Articles</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
                <Link
                  href="/admin/products"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-600 transition-colors flex items-center justify-between"
                >
                  <span>Products Catalog</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
                <Link
                  href="/admin/automation"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-600 transition-colors flex items-center justify-between"
                >
                  <span>Amazon AI Generator</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
                <Link
                  href="/admin/analytics"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand-600 transition-colors flex items-center justify-between"
                >
                  <span>Analytics & Traffic</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
