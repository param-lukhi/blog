'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CountrySelector from './CountrySelector';
import { ShieldCheck, Mail, Send, CheckCircle2, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const categoriesList = [
    { name: 'Mobiles', slug: 'mobiles' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'TVs', slug: 'tvs' },
    { name: 'Earbuds', slug: 'earbuds' },
    { name: 'Smart Watches', slug: 'smart-watches' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
  ];

  const topReviews = [
    { title: 'Apple iPhone 15 Pro Max Review', href: '/blog/apple-iphone-15-pro-max-review' },
    { title: 'Sony WH-1000XM5 Noise Canceling', href: '/blog/sony-wh-1000xm5-review' },
    { title: 'MacBook Air M3 15" Deep Dive', href: '/blog/macbook-air-m3-review' },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-400 text-sm border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Brand & Newsletter */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                T
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                TechPulse
              </span>
            </Link>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Hands-on tech reviews, benchmark comparisons, and real-time Amazon price deals across 20 regional marketplaces.
            </p>

            {/* Newsletter Subscription Form */}
            <div className="pt-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-500" /> Subscribe to Deals & Reviews
              </h4>
              {subscribed ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Subscribed! You will receive weekly tech deals.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col xs:flex-row gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shrink-0 transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Subscribe</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {categoriesList.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Top Reviews & Deals */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Top Reviews & Deals
            </h3>
            <ul className="space-y-2 text-xs">
              {topReviews.map((rev, i) => (
                <li key={i}>
                  <Link href={rev.href} className="hover:text-white transition-colors line-clamp-1">
                    {rev.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/deals" className="text-amazon-orange font-bold hover:underline">
                  🔥 Latest Amazon Deals
                </Link>
              </li>
              <li>
                <Link href="/comparisons" className="hover:text-white transition-colors">
                  ⚖️ Head-to-Head Comparisons
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Company & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate Disclosure</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Amazon Affiliate Disclosure Banner */}
        <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-800 text-xs text-neutral-400 leading-relaxed mb-8">
          <strong className="text-neutral-300">Amazon Affiliate Disclosure:</strong> TechPulse is a participant in the Amazon Services LLC Associates Program and regional Amazon affiliate programs worldwide. As an Amazon Associate, we earn from qualifying purchases. Product prices, availability, and promotions are accurate as of the date/time indicated and are subject to change.
        </div>

        {/* Bottom Bar: Country Selector & Copyright */}
        <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} TechPulse Reviews. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <CountrySelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
