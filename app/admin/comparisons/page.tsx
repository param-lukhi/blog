'use client';

import React, { useEffect, useState } from 'react';
import { GitCompare, Plus, Trash2, Sparkles, FileText, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ComparisonItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  product1Id: string;
  product2Id: string;
  winnerId?: string;
  product1?: { name: string };
  product2?: { name: string };
  status: string;
}

export default function AdminComparisonsPage() {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Generator form state
  const [product1Id, setProduct1Id] = useState('');
  const [product2Id, setProduct2Id] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // Generated draft result state
  const [generatedDraft, setGeneratedDraft] = useState<{
    blog: any;
    duplicateWarning?: string | null;
    seoSuggestions: any;
  } | null>(null);

  const fetchComparisons = () => {
    setLoading(true);
    fetch('/api/comparisons')
      .then((res) => res.json())
      .then((data) => {
        setComparisons(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchComparisons();
    fetch('/api/products?status=ALL')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          if (data.length >= 2) {
            setProduct1Id(data[0].id);
            setProduct2Id(data[1].id);
          }
        }
      });
  }, []);

  const handleGenerateComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product1Id || !product2Id) return;

    setGenerating(true);
    setGeneratedDraft(null);

    try {
      const res = await fetch('/api/comparisons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product1Id,
          product2Id,
          customTitle: customTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedDraft(data);
        fetchComparisons();
      } else {
        alert(data.error || 'Failed to generate comparison draft');
      }
    } catch (err) {
      alert('Error generating comparison draft');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string, compTitle: string) => {
    if (!confirm(`Delete comparison "${compTitle}"?`)) return;
    await fetch(`/api/comparisons/${id}`, { method: 'DELETE' });
    fetchComparisons();
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
          <GitCompare className="w-4 h-4" /> Comparison Builder &amp; Article Generator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          One-Click Comparison Article Generator
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Select any two researched products to automatically build a structured 12-section comparison review, specification matrix, and factual buying recommendations.
        </p>
      </div>

      {/* Comparison Generator Card (PART 1, 2, 3) */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-7 shadow-soft space-y-5">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Generate Comparison Draft (Product A vs Product B)</span>
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Generates Introduction, Specs Grid, Differences, Pros &amp; Cons, User Match, FAQs, and SEO Suggestions.
          </p>
        </div>

        <form onSubmit={handleGenerateComparison} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Select Product 1 (Primary) *
              </label>
              <select
                value={product1Id}
                onChange={(e) => setProduct1Id(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-bold outline-none focus:border-brand-500 cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Select Product 2 (Contender) *
              </label>
              <select
                value={product2Id}
                onChange={(e) => setProduct2Id(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs font-bold outline-none focus:border-brand-500 cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Custom Headline (Optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Leave blank to auto-generate: [Product A] vs [Product B]: Which Should You Buy?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={generating || products.length < 2}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Generating Comparison Article Draft...' : '✨ Generate Comparison Article Draft'}</span>
          </button>
        </form>

        {/* Generated Result Banner */}
        {generatedDraft && (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✓ COMPARISON DRAFT CREATED
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 uppercase font-bold">
                DRAFT
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              {generatedDraft.blog.title}
            </h4>

            {generatedDraft.duplicateWarning && (
              <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 p-2 rounded-xl">
                ⚠️ {generatedDraft.duplicateWarning}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex-wrap">
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Suggested Slug: /{generatedDraft.seoSuggestions.slug}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/blogs/${generatedDraft.blog.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>[Edit Comparison Draft]</span>
                </Link>
                <Link
                  href={`/comparisons/${generatedDraft.seoSuggestions.slug}`}
                  target="_blank"
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1"
                >
                  <span>[View Matrix]</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparisons Registry Table */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse h-40" />
      ) : comparisons.length > 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Published Head-to-Head Comparison Matrices ({comparisons.length})
            </h3>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Comparison Title</th>
                <th className="p-4">Product 1</th>
                <th className="p-4">Product 2</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {comparisons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4 font-extrabold text-neutral-900 dark:text-white max-w-xs truncate">
                    <Link href={`/comparisons/${c.slug}`} target="_blank" className="hover:text-brand-600 flex items-center gap-1">
                      <span>{c.title}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </Link>
                  </td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400 font-medium">{c.product1?.name || '—'}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400 font-medium">{c.product2?.name || '—'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-[10px] uppercase">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.title)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
          <GitCompare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No comparisons created yet.</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Select two products above to generate your first head-to-head comparison article and dynamic matrix.
          </p>
        </div>
      )}
    </div>
  );
}
