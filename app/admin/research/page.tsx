'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass, Plus, Search, Filter, Sparkles, CheckCircle2,
  Clock, AlertTriangle, ExternalLink, Edit3, Trash2, ArrowRight,
  ShieldCheck, HelpCircle, FileText, ShoppingBag, Eye, RefreshCw, Layers
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface VerifiedFacts {
  dimensions?: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW';
  weight?: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW';
  battery?: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW';
  connectivity?: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW';
  warranty?: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW';
  compatibility?: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW';
  price?: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_REVIEW';
}

interface SourceItem {
  type: 'Official Manufacturer' | 'Authorized Retailer' | 'Government' | 'Reputable Publication' | 'Other';
  title: string;
  url: string;
  notes?: string;
  accessedDate?: string;
}

interface ProductResearch {
  id: string;
  name: string;
  productName?: string;
  brand: string | null;
  model: string | null;
  category: string;
  productUrl: string | null;
  imageUrl?: string | null;
  image?: string | null;
  researchNotes: string | null;
  targetAudience: string | null;
  searchIntent: string | null;
  articleAngle?: string | null;
  suggestedAngle?: string | null;
  status: string;
  specifications: string | null;
  keyFeatures: string | null;
  pros: string | null;
  cons: string | null;
  limitations?: string | null;
  alternatives?: string | null;
  officialSources: string | null;
  factVerification?: string | null;
  verifiedFacts?: string | null;
  authorId?: string | null;
  productId: string | null;
  blogId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Suggestion {
  id: string;
  productName: string;
  brand: string;
  category: string;
  relevanceType: string;
  whyUseful: string;
  searchIntent: string;
  potentialAngle: string;
  targetAudience: string;
  requiredResearch: string[];
  comparisonOpportunities: string[];
  affiliatePotential: string;
  suggestedSpecs: Record<string, string>;
}

export default function ProductResearchPage() {
  const [researchList, setResearchList] = useState<ProductResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductResearch | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [dailySuggestions, setDailySuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // One-Click Article Workflow State
  const [workflowModal, setWorkflowModal] = useState<{
    isOpen: boolean;
    item: ProductResearch | null;
    running: boolean;
    steps: { step: string; label: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'; detail?: string }[];
    result: any | null;
    error: string | null;
  }>({
    isOpen: false,
    item: null,
    running: false,
    steps: [],
    result: null,
    error: null,
  });

  // Form State
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    model: '',
    category: 'Audio & Headphones',
    productUrl: '',
    image: '',
    researchNotes: '',
    targetAudience: '',
    searchIntent: '',
    suggestedAngle: '',
    status: 'IDEA',
    researcher: 'Editorial Team',
    specifications: '{}',
    keyFeatures: '[]',
    pros: '[]',
    cons: '[]',
    alternatives: '[]',
    officialSources: [] as SourceItem[],
    verifiedFacts: {
      dimensions: 'UNVERIFIED',
      weight: 'UNVERIFIED',
      battery: 'UNVERIFIED',
      connectivity: 'UNVERIFIED',
      warranty: 'UNVERIFIED',
      compatibility: 'UNVERIFIED',
      price: 'UNVERIFIED',
    } as VerifiedFacts,
  });

  const fetchResearch = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/research', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setResearchList(data);
      }
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, [statusFilter, searchQuery]);

  const loadDailySuggestions = async () => {
    setIsSuggestionsOpen(true);
    setLoadingSuggestions(true);
    try {
      const res = await fetch('/api/research/suggestions');
      if (res.ok) {
        const data = await res.json();
        setDailySuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      productName: '',
      brand: '',
      model: '',
      category: 'Audio & Headphones',
      productUrl: '',
      image: '',
      researchNotes: '',
      targetAudience: '',
      searchIntent: '',
      suggestedAngle: '',
      status: 'IDEA',
      researcher: 'Editorial Team',
      specifications: '{}',
      keyFeatures: '[]',
      pros: '[]',
      cons: '[]',
      alternatives: '[]',
      officialSources: [],
      verifiedFacts: {
        dimensions: 'UNVERIFIED',
        weight: 'UNVERIFIED',
        battery: 'UNVERIFIED',
        connectivity: 'UNVERIFIED',
        warranty: 'UNVERIFIED',
        compatibility: 'UNVERIFIED',
        price: 'UNVERIFIED',
      },
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (item: ProductResearch) => {
    setEditingItem(item);
    let parsedSources: SourceItem[] = [];
    let parsedFacts: VerifiedFacts = {};
    try {
      const factsStr = item.factVerification || item.verifiedFacts;
      if (factsStr) parsedFacts = JSON.parse(factsStr);
    } catch {}

    setFormData({
      productName: item.name || item.productName || '',
      brand: item.brand || '',
      model: item.model || '',
      category: item.category || 'General',
      productUrl: item.productUrl || '',
      image: item.imageUrl || item.image || '',
      researchNotes: item.researchNotes || '',
      targetAudience: item.targetAudience || '',
      searchIntent: item.searchIntent || '',
      suggestedAngle: item.articleAngle || item.suggestedAngle || '',
      status: item.status,
      researcher: 'Editorial Team',
      specifications: item.specifications || '{}',
      keyFeatures: item.keyFeatures || '[]',
      pros: item.pros || '[]',
      cons: item.cons || '[]',
      alternatives: item.limitations || item.alternatives || '[]',
      officialSources: parsedSources,
      verifiedFacts: {
        dimensions: parsedFacts.dimensions || 'UNVERIFIED',
        weight: parsedFacts.weight || 'UNVERIFIED',
        battery: parsedFacts.battery || 'UNVERIFIED',
        connectivity: parsedFacts.connectivity || 'UNVERIFIED',
        warranty: parsedFacts.warranty || 'UNVERIFIED',
        compatibility: parsedFacts.compatibility || 'UNVERIFIED',
        price: parsedFacts.price || 'UNVERIFIED',
      },
    });
    setIsFormOpen(true);
  };

  const handleImportSuggestion = async (sug: Suggestion) => {
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: sug.productName,
          brand: sug.brand,
          category: sug.category,
          searchIntent: sug.searchIntent,
          suggestedAngle: sug.potentialAngle,
          targetAudience: sug.targetAudience,
          researchNotes: `Why Useful: ${sug.whyUseful}\n\nRequired Verification:\n- ${sug.requiredResearch.join('\n- ')}`,
          specifications: sug.suggestedSpecs,
          alternatives: sug.comparisonOpportunities,
          status: 'RESEARCHING',
          researcher: 'Editorial Team',
          verifiedFacts: {
            dimensions: 'UNVERIFIED',
            weight: 'UNVERIFIED',
            battery: 'UNVERIFIED',
            connectivity: 'UNVERIFIED',
            warranty: 'UNVERIFIED',
            compatibility: 'UNVERIFIED',
            price: 'UNVERIFIED',
          },
        }),
      });

      if (res.ok) {
        setIsSuggestionsOpen(false);
        fetchResearch();
      }
    } catch (e) {
      console.error('Import error:', e);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        officialSources: formData.officialSources,
        verifiedFacts: formData.verifiedFacts,
      };

      const url = editingItem ? `/api/research/${editingItem.id}` : '/api/research';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchResearch();
      }
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research item?')) return;
    try {
      const res = await fetch(`/api/research/${id}`, { method: 'DELETE' });
      if (res.ok) fetchResearch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartArticleWorkflow = async (item: ProductResearch) => {
    const initialSteps: { step: string; label: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'; detail?: string }[] = [
      { step: 'validation', label: 'Preparing research...', status: 'RUNNING', detail: 'Loading verified research item and sources...' },
      { step: 'duplicate_check', label: 'Checking existing articles...', status: 'PENDING', detail: 'Checking idempotency and duplicate slugs...' },
      { step: 'content_brief', label: 'Preparing content brief...', status: 'PENDING', detail: 'Synthesizing verified specifications and article angle...' },
      { step: 'draft_generation', label: 'Generating article...', status: 'PENDING', detail: 'Drafting structured article with verified sections...' },
      { step: 'seo_links', label: 'Preparing SEO...', status: 'PENDING', detail: 'Structuring meta titles, descriptions, and internal links...' },
      { step: 'quality_gate', label: 'Running quality checks...', status: 'PENDING', detail: 'Evaluating fact verification against quality gate...' },
      { step: 'review_queue', label: 'Final status: REVIEW', status: 'PENDING', detail: 'Registering in Review Queue for human approval...' },
    ];

    setWorkflowModal({
      isOpen: true,
      item,
      running: true,
      steps: initialSteps,
      result: null,
      error: null,
    });

    try {
      const res = await fetch(`/api/research/${item.id}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        setWorkflowModal(prev => ({
          ...prev,
          running: false,
          error: data.error || 'Article generation failed. Research data was preserved. Please retry.',
          steps: data.steps || prev.steps.map(s => s.status === 'RUNNING' ? { ...s, status: 'FAILED' } : s),
        }));
        return;
      }

      setWorkflowModal(prev => ({
        ...prev,
        running: false,
        result: data,
        steps: data.steps || [
          { step: 'validation', label: 'Research loaded', status: 'COMPLETED', detail: '✓ Research loaded' },
          { step: 'duplicate_check', label: 'Idempotency verified', status: 'COMPLETED', detail: '✓ Duplicate protection passed' },
          { step: 'content_brief', label: 'Content brief ready', status: 'COMPLETED', detail: '✓ Content brief ready' },
          { step: 'draft_generation', label: 'Draft generated', status: 'COMPLETED', detail: '✓ Draft generated' },
          { step: 'seo_links', label: 'SEO prepared', status: 'COMPLETED', detail: '✓ SEO prepared' },
          { step: 'quality_gate', label: 'Quality check complete', status: 'COMPLETED', detail: '✓ Quality check complete' },
          { step: 'review_queue', label: 'Final status: REVIEW', status: 'COMPLETED', detail: '✓ Ready for Human Review' },
        ],
      }));
      fetchResearch();
    } catch (err: any) {
      setWorkflowModal(prev => ({
        ...prev,
        running: false,
        error: `Article generation failed. Research data was preserved. Please retry. (${err?.message || 'Network Error'})`,
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IDEA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Idea</span>;
      case 'RESEARCHING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Researching</span>;
      case 'RESEARCHED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Researched</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">Draft</span>;
      case 'REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">Needs Review</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Approved</span>;
      case 'PUBLISHED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Published</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">{status}</span>;
    }
  };

  const getFactBadge = (status?: string) => {
    if (status === 'VERIFIED') {
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
    }
    if (status === 'NEEDS_REVIEW') {
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md"><AlertTriangle className="w-3 h-3" /> Needs Review</span>;
    }
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md"><HelpCircle className="w-3 h-3" /> Unverified</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Product Research Queue
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Grounded daily topic discovery, traceable source management, and fact verification pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDailySuggestions}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Daily 3 Suggestions
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Research Item
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product, brand, or intent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'IDEA', 'RESEARCHING', 'RESEARCHED', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Research Queue Table */}
      <div className="bg-white dark:bg-[#121826] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading research queue...
          </div>
        ) : researchList.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">Research Queue Empty</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              No products found for the selected filter. Generate daily product suggestions or add a new topic to begin the workflow.
            </p>
            <button
              onClick={loadDailySuggestions}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              Load Daily Suggestions
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300">
                  <th className="py-3.5 px-4 font-bold">Product / Topic</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Search Intent & Angle</th>
                  <th className="py-3.5 px-4 font-bold">Fact Verification</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {researchList.map((item) => {
                  let facts: VerifiedFacts = {};
                  try {
                    const factsStr = item.factVerification || item.verifiedFacts;
                    if (factsStr) facts = JSON.parse(factsStr);
                  } catch {}

                  const displayName = item.name || item.productName || 'Unnamed Product';
                  const displayAngle = item.articleAngle || item.suggestedAngle;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white text-sm">
                          {displayName}
                        </div>
                        {item.brand && (
                          <div className="text-neutral-400 text-[11px]">Brand: {item.brand} {item.model ? `(${item.model})` : ''}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-neutral-600 dark:text-neutral-400">
                        {item.category}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        {item.searchIntent && (
                          <div className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            {item.searchIntent}
                          </div>
                        )}
                        {displayAngle && (
                          <div className="text-[11px] text-neutral-400 truncate">
                            Angle: {displayAngle}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {getFactBadge(facts.battery)}
                          {getFactBadge(facts.price)}
                          {getFactBadge(facts.warranty)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                          {/* Lifecycle Primary Action Button (Section 18) */}
                          {item.status === 'IDEA' && (
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs flex items-center gap-1 transition shrink-0"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Start Research</span>
                            </button>
                          )}
                          {item.status === 'RESEARCHING' && (
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1 transition shrink-0"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Continue Research</span>
                            </button>
                          )}
                          {item.status === 'RESEARCHED' && (
                            <button
                              onClick={() => handleStartArticleWorkflow(item)}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition hover:scale-105 active:scale-95 shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Create Article Draft</span>
                            </button>
                          )}
                          {item.status === 'DRAFT' && (
                            <Link
                              href={item.blogId ? `/admin/blogs/${item.blogId}` : '/admin/blogs'}
                              className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold text-xs flex items-center gap-1 transition shrink-0"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Open Draft</span>
                            </Link>
                          )}
                          {item.status === 'REVIEW' && (
                            <Link
                              href={item.blogId ? `/admin/blogs/${item.blogId}` : '/admin/content/publishing'}
                              className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-bold text-xs flex items-center gap-1 transition shrink-0"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Open Review</span>
                            </Link>
                          )}
                          {item.status === 'APPROVED' && (
                            <Link
                              href={item.blogId ? `/admin/blogs/${item.blogId}` : '/admin/blogs'}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1 transition shrink-0"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>View Approved Article</span>
                            </Link>
                          )}
                          {item.status === 'PUBLISHED' && (
                            <Link
                              href={item.blogId ? `/admin/blogs/${item.blogId}` : '/admin/blogs'}
                              className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/50 hover:bg-green-100 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 font-bold text-xs flex items-center gap-1 transition shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View Published Article</span>
                            </Link>
                          )}

                          {/* Utility actions */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0"
                            title="Edit & Verify Research"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Article Workflow Progress Modal */}
      {workflowModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121826] w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Article Production Pipeline
                </span>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
                  {workflowModal.item?.name}
                </h3>
              </div>
              {!workflowModal.running && (
                <button
                  onClick={() => setWorkflowModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Error Banner */}
            {workflowModal.error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Workflow Error</span>
                </div>
                <p>{workflowModal.error}</p>
              </div>
            )}

            {/* Step-by-Step Progress List */}
            <div className="space-y-3">
              {workflowModal.steps.map((step, idx) => (
                <div
                  key={step.step || idx}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                      : step.status === 'RUNNING'
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 animate-pulse'
                      : step.status === 'FAILED'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                      : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-neutral-500'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {step.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : step.status === 'RUNNING' ? (
                      <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : step.status === 'FAILED' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold">{step.label}</div>
                    {step.detail && (
                      <div className="text-[11px] opacity-80">{step.detail}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Success Action Footer */}
            {workflowModal.result && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-neutral-500">
                  Status: <strong className="text-orange-600 dark:text-orange-400 font-bold">REVIEW</strong> (Human Review Required)
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/admin/blogs/${workflowModal.result.blogId}`}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center shadow-md shadow-blue-500/20"
                  >
                    Open in Review Queue →
                  </Link>
                  <button
                    onClick={() => setWorkflowModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Suggestions Modal */}
      {isSuggestionsOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121826] w-full max-w-3xl rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Daily Editorial Opportunities
                </span>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                  3 Search-Oriented Product Suggestions
                </h3>
              </div>
              <button
                onClick={() => setIsSuggestionsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            {loadingSuggestions ? (
              <div className="py-12 text-center text-xs text-neutral-400">Generating grounded daily suggestions...</div>
            ) : (
              <div className="space-y-4">
                {dailySuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {sug.relevanceType}
                        </span>
                        <h4 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                          {sug.productName}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleImportSuggestion(sug)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors self-start sm:self-auto"
                      >
                        + Add to Queue
                      </button>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      <strong>Why Cover:</strong> {sug.whyUseful}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <div><strong>Search Intent:</strong> {sug.searchIntent}</div>
                      <div><strong>Potential Angle:</strong> {sug.potentialAngle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Research Record Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121826] w-full max-w-4xl rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Editorial Research Record
                </span>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                  {editingItem ? 'Edit & Verify Product Research' : 'Create Product Research Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Sony"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Workflow Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold"
                  >
                    <option value="IDEA">IDEA</option>
                    <option value="RESEARCHING">RESEARCHING</option>
                    <option value="RESEARCHED">RESEARCHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Official Product URL
                  </label>
                  <input
                    type="url"
                    value={formData.productUrl}
                    onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                    placeholder="https://sony.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                  />
                </div>
              </div>

              {/* Strategy & Search Intent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Search Intent
                  </label>
                  <input
                    type="text"
                    value={formData.searchIntent}
                    onChange={(e) => setFormData({ ...formData, searchIntent: e.target.value })}
                    placeholder="e.g. Commercial Investigation / Best ANC headphones"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Suggested Article Angle
                  </label>
                  <input
                    type="text"
                    value={formData.suggestedAngle}
                    onChange={(e) => setFormData({ ...formData, suggestedAngle: e.target.value })}
                    placeholder="e.g. Sony WH-1000XM5 Spec Breakdown vs Bose QC Ultra"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
                  />
                </div>
              </div>

              {/* Fact Verification Layer */}
              <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Product Fact Verification Status
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['battery', 'dimensions', 'weight', 'connectivity', 'warranty', 'compatibility', 'price'] as const).map((field) => (
                    <div key={field} className="space-y-1">
                      <span className="text-[11px] font-semibold capitalize text-neutral-600 dark:text-neutral-400">{field}</span>
                      <select
                        value={formData.verifiedFacts[field] || 'UNVERIFIED'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verifiedFacts: {
                              ...formData.verifiedFacts,
                              [field]: e.target.value as any,
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11px]"
                      >
                        <option value="UNVERIFIED">Unverified</option>
                        <option value="NEEDS_REVIEW">Needs Review</option>
                        <option value="VERIFIED">Verified</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Research Notes & Verified Sources
                </label>
                <textarea
                  rows={4}
                  value={formData.researchNotes}
                  onChange={(e) => setFormData({ ...formData, researchNotes: e.target.value })}
                  placeholder="Record citations, official manual links, test data notes, and verified reviewer consensus..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono"
                />
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Save Research Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
