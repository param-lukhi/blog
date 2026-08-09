'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Sparkles, Shield } from 'lucide-react';
import CountrySelector from './CountrySelector';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import WishlistButton from './WishlistButton';
import NotificationBell from './NotificationBell';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Header() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('TechPulse');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Fetch categories & site settings
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.site_name) setSiteName(data.site_name);
      })
      .catch(() => {});

    // Check if admin is logged in
    fetch('/api/admin/check-auth')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.authenticated) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
        }
      })
      .catch(() => setIsAdminAuthenticated(false));
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Reviews', href: '/blog' },
    { name: 'Best Products', href: '/products' },
    { name: 'Comparisons', href: '/comparisons' },
    { name: 'Deals', href: '/deals', isSpecial: true },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform">
              {siteName.charAt(0)}
            </div>
            <span className="font-extrabold text-lg sm:text-xl text-neutral-900 dark:text-white tracking-tight font-sans truncate max-w-[130px] xs:max-w-none">
              {siteName}
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md justify-center">
            <SearchBar />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <Link
              href="/"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            <Link
              href="/blog"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/blog') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Reviews
              {isActive('/blog') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            <Link
              href="/products"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/products') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Best Products
              {isActive('/products') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            <Link
              href="/comparisons"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/comparisons') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              Comparisons
              {isActive('/comparisons') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button
                className={`flex items-center gap-1 py-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors outline-none ${
                  isActive('/category') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
                }`}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                Categories
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCategoryOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 px-1 grid grid-cols-1 gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-colors flex items-center justify-between"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        <span>{cat.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-neutral-400">Loading categories...</div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/deals"
              className={`relative py-1 flex items-center gap-1 text-amazon-orange font-bold hover:text-amazon-hover transition-colors ${
                isActive('/deals') ? 'underline underline-offset-4' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Deals
            </Link>

            <Link
              href="/about"
              className={`relative py-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive('/about') ? 'text-brand-600 dark:text-brand-400 font-bold' : ''
              }`}
            >
              About
              {isActive('/about') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>
          </nav>

          {/* Right Action Icons & Selectors */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Country Selector - Desktop / Tablet */}
            <div className="hidden sm:block">
              <CountrySelector />
            </div>

            {/* Notification Bell - Desktop / Tablet */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Wishlist Button - Desktop / Tablet */}
            <div className="hidden sm:block">
              <WishlistButton />
            </div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Mobile Country & Quick Actions Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 sm:hidden">
            <CountrySelector />
            <div className="flex items-center gap-2">
              <NotificationBell />
              <WishlistButton />
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/blog"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/blog') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/products"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/products') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Best Products
            </Link>
            <Link
              href="/comparisons"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/comparisons') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comparisons
            </Link>
            <Link
              href="/deals"
              className={`block px-3 py-2 rounded-xl text-sm font-bold text-amazon-orange hover:bg-neutral-100 dark:hover:bg-neutral-800`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Amazon Deals
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/about') ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href="/wishlist"
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="px-3 py-1 font-extrabold text-[10px] text-neutral-400 uppercase tracking-wider">
              Popular Categories
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
