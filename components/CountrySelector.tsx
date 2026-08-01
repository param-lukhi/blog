'use client';

import React, { useState, useEffect } from 'react';
import { MARKETPLACE_LIST, getMarketplaceByCode, detectBrowserCountry } from '@/lib/location';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';

export default function CountrySelector() {
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // 1. Initial browser locale detection
    const current = detectBrowserCountry();
    setSelectedCountry(current);

    // 2. IP Geolocation API in background if not saved in localStorage
    if (!localStorage.getItem('user_country')) {
      fetch('/api/location')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.country) {
            setSelectedCountry(data.country);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSelect = (code: string) => {
    setSelectedCountry(code);
    localStorage.setItem('user_country', code);
    setIsOpen(false);

    // Notify all components to re-render local prices dynamically
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('countryChange', { detail: { country: code } }));
    }
  };

  const currentMarket = getMarketplaceByCode(selectedCountry);

  const filteredMarketplaces = MARKETPLACE_LIST.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.currency.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/90 text-neutral-800 text-xs font-bold transition-all border border-neutral-200/80 shadow-2xs"
        title="Change Amazon Region & Currency"
      >
        <span className="text-sm leading-none">{currentMarket.flag}</span>
        <span>{currentMarket.symbol}</span>
        <span className="text-[10px] text-neutral-500 font-extrabold uppercase">{currentMarket.code}</span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-soft-lg border border-neutral-200/90 py-2.5 z-50 animate-in fade-in duration-150">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 flex items-center justify-between">
            <span>20 Amazon Marketplaces</span>
            <Globe className="w-3.5 h-3.5 text-brand-600" />
          </div>

          {/* Search box for 20 marketplaces */}
          <div className="px-3 py-2 border-b border-neutral-100">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5" />
              <input
                type="text"
                placeholder="Search country or currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5 px-1 py-1">
            {filteredMarketplaces.length === 0 ? (
              <div className="p-3 text-center text-xs text-neutral-400 font-medium">No marketplace found</div>
            ) : (
              filteredMarketplaces.map((market) => {
                const isSelected = market.code === selectedCountry;
                return (
                  <button
                    key={market.code}
                    onClick={() => handleSelect(market.code)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 font-extrabold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{market.flag}</span>
                      <div className="truncate">
                        <div className="font-bold leading-snug truncate">{market.name}</div>
                        <div className="text-[10px] text-neutral-400 font-normal truncate">
                          {market.currency} ({market.symbol}) • {market.domain}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0 ml-1" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
