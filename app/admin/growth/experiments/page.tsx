'use client';

import React, { useEffect, useState } from 'react';
import {
  FlaskConical, Plus, Play, Pause, CheckCircle2,
  AlertCircle, ShieldCheck, RefreshCw, BarChart2
} from 'lucide-react';

export default function GrowthExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newExp, setNewExp] = useState({
    name: '',
    hypothesis: '',
    targetMetric: 'AFFILIATE_CLICKS',
    variantA: 'Standard CTA ("Check Price on Amazon")',
    variantB: 'Action CTA ("View Verified Discount & Availability")',
  });

  const fetchExperiments = () => {
    setLoading(true);
    fetch('/api/admin/growth/experiments')
      .then(res => res.json())
      .then(d => {
        setExperiments(d.experiments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/growth/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExp.name,
          hypothesis: newExp.hypothesis,
          targetMetric: newExp.targetMetric,
          variants: { A: newExp.variantA, B: newExp.variantB },
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewExp({
          name: '',
          hypothesis: '',
          targetMetric: 'AFFILIATE_CLICKS',
          variantA: 'Standard CTA ("Check Price on Amazon")',
          variantB: 'Action CTA ("View Verified Discount & Availability")',
        });
        fetchExperiments();
      }
    } catch (e) {}
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/growth/experiments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchExperiments();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Growth Experiments & A/B Testing</h1>
          </div>
          <p className="text-sm text-slate-400">
            Scientifically test title phrasing, affiliate CTA placement, and layout without affecting legal disclosures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-900/30"
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-start gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">A/B Testing Safety Policy: </span>
          Experiments use deterministic assignment without invasive tracking. Mandatory affiliate disclosures, terms of service, and unsubscribe links are permanently excluded from experimentation.
        </div>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading experiments...</div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
            <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="font-medium text-white">No Growth Experiments Created</div>
            <div className="text-xs text-slate-500 mt-1">
              Create your first test to measure CTA copy, comparison tables, or title CTR.
            </div>
          </div>
        ) : (
          experiments.map((exp: any) => {
            const parsedVariants = typeof exp.variants === 'string' ? JSON.parse(exp.variants) : exp.variants;
            return (
              <div key={exp.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{exp.name}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        exp.status === 'RUNNING'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : exp.status === 'CONCLUDED'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {exp.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      <span className="text-slate-500">Hypothesis: </span>
                      {exp.hypothesis}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {exp.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusChange(exp.id, 'RUNNING')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Test
                      </button>
                    )}
                    {exp.status === 'RUNNING' && (
                      <button
                        onClick={() => handleStatusChange(exp.id, 'CONCLUDED')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700"
                      >
                        <Pause className="w-3.5 h-3.5" /> Conclude
                      </button>
                    )}
                  </div>
                </div>

                {/* Variants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                      Variant A (Control)
                    </div>
                    <div className="text-sm text-slate-200">{parsedVariants?.A || 'Control'}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                      Variant B (Test)
                    </div>
                    <div className="text-sm text-slate-200">{parsedVariants?.B || 'Variant 1'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Target Metric: <strong className="text-slate-300">{exp.targetMetric}</strong></span>
                  <span>Created: {new Date(exp.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Create Growth Experiment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Experiment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Affiliate CTA Button Copy Test"
                  value={newExp.name}
                  onChange={e => setNewExp({ ...newExp, name: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Hypothesis</label>
                <textarea
                  required
                  placeholder="e.g., Adding verified discount phrasing increases click-through rate to merchant."
                  value={newExp.hypothesis}
                  onChange={e => setNewExp({ ...newExp, hypothesis: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 h-20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Target Metric</label>
                <select
                  value={newExp.targetMetric}
                  onChange={e => setNewExp({ ...newExp, targetMetric: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="AFFILIATE_CLICKS">Affiliate Clicks (Outbound)</option>
                  <option value="CTR">Search / Page CTR</option>
                  <option value="NEWSLETTER_SIGNUPS">Newsletter Signups</option>
                  <option value="QUIZ_COMPLETIONS">Buying Quiz Completions</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400">Variant A</label>
                  <input
                    type="text"
                    value={newExp.variantA}
                    onChange={e => setNewExp({ ...newExp, variantA: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400">Variant B</label>
                  <input
                    type="text"
                    value={newExp.variantB}
                    onChange={e => setNewExp({ ...newExp, variantB: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-500"
                >
                  Save Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
