'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Send, Target, CheckCircle2, Clock, FileText,
  Search, Sparkles, RefreshCw, ArrowUpRight, AlertCircle,
  Plus, Play, BookOpen, ShieldCheck, ShieldAlert
} from 'lucide-react';

export default function PublishingWorkspacePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetCount, setTargetCount] = useState<number>(1);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newType, setNewType] = useState('PRODUCT_REVIEW');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchWorkspace = () => {
    setLoading(true);
    fetch('/api/admin/content/publishing')
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d.summary?.dailyTarget) setTargetCount(d.summary.dailyTarget);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/content/publishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_TARGET', targetCount }),
      });
      setShowGoalModal(false);
      fetchWorkspace();
    } catch (e) {}
  };

  const handleStartArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/content/publishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'START_ARTICLE',
          topic: newTopic,
          contentType: newType,
        }),
      });
      setShowAddModal(false);
      setNewTopic('');
      fetchWorkspace();
    } catch (e) {}
  };

  const handleAdvanceStatus = async (id: string, nextStatus: string) => {
    try {
      await fetch('/api/admin/content/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      fetchWorkspace();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Daily Publishing Workspace</h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/20">
              Phase 9 Active
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Disciplined daily article production pipeline enforcing fact verification, SEO checks, and human approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGoalModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700"
          >
            Configure Goal
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" /> Start Article
          </button>
        </div>
      </div>

      {/* Daily Target Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white">Daily Publishing Goal:</span>
            <span className="text-slate-300">
              {data?.summary?.publishedToday || 0} / {data?.summary?.dailyTarget || 1} Published Today
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Completion: <strong className="text-emerald-400 font-semibold">{data?.summary?.completionPercent || 0}%</strong>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, data?.summary?.completionPercent || 0)}%` }}
          />
        </div>
      </div>

      {/* Production Pipeline Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-xs font-semibold text-slate-400 uppercase">Idea</div>
          <div className="text-xl font-bold text-white mt-1">{data?.summary?.counts?.idea || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-xs font-semibold text-sky-400 uppercase">Research</div>
          <div className="text-xl font-bold text-white mt-1">
            {(data?.summary?.counts?.researching || 0) + (data?.summary?.counts?.researched || 0)}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-xs font-semibold text-purple-400 uppercase">Drafting</div>
          <div className="text-xl font-bold text-white mt-1">{data?.summary?.counts?.draft || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-xs font-semibold text-amber-400 uppercase">Review</div>
          <div className="text-xl font-bold text-white mt-1">{data?.summary?.counts?.review || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-xs font-semibold text-indigo-400 uppercase">Approved</div>
          <div className="text-xl font-bold text-white mt-1">{data?.summary?.counts?.approved || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-xs font-semibold text-emerald-400 uppercase">Published</div>
          <div className="text-xl font-bold text-white mt-1">{data?.summary?.counts?.published || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-xs font-semibold text-rose-400 uppercase">Update Req</div>
          <div className="text-xl font-bold text-white mt-1">{data?.summary?.counts?.updateRequired || 0}</div>
        </div>
      </div>

      {/* Production Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Active Content Production Queue
          </h2>
          <button
            onClick={fetchWorkspace}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading production queue...</div>
        ) : !data?.queue || data.queue.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Production queue is currently empty. Click &quot;Start Article&quot; or select an opportunity from the Content Hub.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 text-sm">
            {data.queue.map((item: any) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-800/40 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.topic}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {item.contentType}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.priority === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Source: <strong className={item.sourceStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}>{item.sourceStatus}</strong></span>
                    <span>Research: <strong className={item.researchStatus === 'COMPLETED' ? 'text-emerald-400' : 'text-sky-400'}>{item.researchStatus}</strong></span>
                    <span>Intent: <strong className="text-slate-300">{item.searchIntent || 'COMMERCIAL'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : item.status === 'DRAFT'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.status}
                  </span>

                  {item.status === 'RESEARCHING' && (
                    <button
                      onClick={() => handleAdvanceStatus(item.id, 'DRAFT')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Start Draft
                    </button>
                  )}
                  {item.status === 'DRAFT' && (
                    <button
                      onClick={() => handleAdvanceStatus(item.id, 'REVIEW')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Submit for Review
                    </button>
                  )}
                  {item.status === 'REVIEW' && (
                    <button
                      onClick={() => handleAdvanceStatus(item.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Approve Article
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Config Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Set Daily Target</h2>
            <form onSubmit={handleUpdateTarget} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Target Articles Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={targetCount}
                  onChange={e => setTargetCount(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Start New Article</h2>
            <form onSubmit={handleStartArticle} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Article Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5: In-Depth 2026 Review"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Content Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PRODUCT_REVIEW">Product Review</option>
                  <option value="BUYING_GUIDE">Buying Guide</option>
                  <option value="COMPARISON">Product Comparison</option>
                  <option value="INFORMATIONAL">Informational Article</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500"
                >
                  Queue Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
