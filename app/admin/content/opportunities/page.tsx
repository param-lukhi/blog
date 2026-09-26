'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles, Plus, CheckCircle2, AlertCircle, FileText,
  RefreshCw, ArrowUpRight, Search, ShieldAlert, BookOpen
} from 'lucide-react';

export default function ContentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [brief, setBrief] = useState<any>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  const fetchOpportunities = () => {
    setLoading(true);
    fetch('/api/admin/content/opportunities')
      .then(res => res.json())
      .then(d => {
        setOpportunities(d.opportunities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleGenerateBrief = async (topic: string) => {
    setSelectedTopic(topic);
    setGeneratingBrief(true);
    setBrief(null);
    try {
      const res = await fetch('/api/admin/content/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setBrief(data.brief);
    } catch (e) {
    } finally {
      setGeneratingBrief(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/content/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchOpportunities();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Content Opportunity Engine</h1>
          </div>
          <p className="text-sm text-slate-400">
            Rules-based gap detection across product comparisons, buying guides, and high-volume search queries.
          </p>
        </div>

        <button
          onClick={fetchOpportunities}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Discovery Engine
        </button>
      </div>

      {/* Main Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunities List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Discovering content gaps...</div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              No content opportunities recorded. Run the discovery engine to evaluate catalog gaps.
            </div>
          ) : (
            opportunities.map((opp: any) => (
              <div key={opp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{opp.topic}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                        opp.priority === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}>
                        {opp.priority}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      <span className="text-slate-500 font-medium">Reason: </span>
                      {opp.reason}
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-mono flex-shrink-0">
                    {opp.opportunityType}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400">
                  <span className="text-slate-500 font-semibold">Evidence: </span>
                  {opp.evidence}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateBrief(opp.topic)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Generate Brief
                    </button>
                    {opp.status === 'DISCOVERED' ? (
                      <button
                        onClick={() => handleStatusChange(opp.id, 'PLANNED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700"
                      >
                        Mark Planned
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {opp.status}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500">
                    Intent: {opp.suggestedSearchIntent || 'INFORMATIONAL'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Content Brief Panel (1 col) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 h-fit sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Research Brief Viewer
            </h2>
          </div>

          {generatingBrief ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Generating structured fact-check brief...
            </div>
          ) : !brief ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click &quot;Generate Brief&quot; on any opportunity to view the fact-checked outline and verification checklist.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider">Recommended Title</div>
                <div className="text-white font-bold text-sm mt-0.5">{brief.recommendedTitle}</div>
              </div>

              <div>
                <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider">Facts to Verify</div>
                <div className="space-y-1.5 mt-1">
                  {brief.factsToVerify?.map((f: any, i: number) => (
                    <div key={i} className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                      <div className="text-slate-300 font-medium">{f.claim}</div>
                      <div className="text-amber-400 text-[10px] mt-0.5">Required: {f.sourceRequirement}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider">Required Outline</div>
                <ol className="list-decimal pl-4 space-y-1 mt-1 text-slate-300">
                  {brief.outline?.map((s: any, i: number) => (
                    <li key={i}>{s.section}</li>
                  ))}
                </ol>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-300 text-[11px]">
                <ShieldAlert className="w-4 h-4 text-amber-400 mb-1" />
                {brief.humanReviewNotice}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
