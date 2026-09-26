'use client';

import React, { useEffect, useState } from 'react';
import {
  Compass, FolderKanban, FileText, ShoppingBag,
  GitCompare, CheckCircle2, AlertCircle, RefreshCw, ArrowUpRight
} from 'lucide-react';

export default function TopicalMapPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMap = () => {
    setLoading(true);
    fetch('/api/admin/seo/topical-map')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMap();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Topical Coverage Map</h1>
          </div>
          <p className="text-sm text-slate-400">
            Understand content cluster depth, pillar guides, supporting reviews, and coverage gaps per category.
          </p>
        </div>

        <button
          onClick={fetchMap}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Map
        </button>
      </div>

      {/* Cluster Map Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Mapping topical clusters...</div>
        ) : !data?.topicalMap || data.topicalMap.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            No categories found in database.
          </div>
        ) : (
          data.topicalMap.map((cluster: any) => (
            <div key={cluster.categoryId} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-sky-400" />
                    <h2 className="text-lg font-bold text-white">{cluster.categoryName}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      cluster.clusterHealth === 'STRONG'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : cluster.clusterHealth === 'MODERATE'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {cluster.clusterHealth} CLUSTER
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    /category/{cluster.categorySlug}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Products: <strong className="text-white">{cluster.products.length}</strong></span>
                  <span>Articles: <strong className="text-white">{(cluster.pillar ? 1 : 0) + cluster.supportingArticles.length}</strong></span>
                  <span>Comparisons: <strong className="text-white">{cluster.comparisons.length}</strong></span>
                </div>
              </div>

              {/* Cluster Structure Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Pillar */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Pillar Guide
                  </div>
                  {cluster.pillar ? (
                    <div>
                      <div className="text-slate-200 font-medium">{cluster.pillar.title}</div>
                      <div className="text-slate-500 font-mono mt-1">/blog/{cluster.pillar.slug}</div>
                    </div>
                  ) : (
                    <div className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing Pillar Guide
                    </div>
                  )}
                </div>

                {/* Supporting Articles */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Supporting Articles ({cluster.supportingArticles.length})
                  </div>
                  {cluster.supportingArticles.length > 0 ? (
                    <ul className="space-y-1 text-slate-300">
                      {cluster.supportingArticles.slice(0, 3).map((a: any) => (
                        <li key={a.id} className="truncate">• {a.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-slate-500">No supporting reviews yet.</div>
                  )}
                </div>

                {/* Head-to-Head Comparisons */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitCompare className="w-3.5 h-3.5" /> Comparisons ({cluster.comparisons.length})
                  </div>
                  {cluster.comparisons.length > 0 ? (
                    <ul className="space-y-1 text-slate-300">
                      {cluster.comparisons.slice(0, 3).map((c: any) => (
                        <li key={c.id} className="truncate">• {c.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing Comparison Guide
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
