'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, CheckSquare, Info } from 'lucide-react';
import { evaluateBlogQuality, BlogQualityReport } from '@/lib/qualityCheck';

interface BlogQualityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogData: {
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    content: string;
    featuredImage: string;
    amazonUrl: string;
    affiliateUrl: string;
    faqs: any;
    qualityChecklist: Record<string, boolean>;
  };
  onUpdateChecklist: (key: string, value: boolean) => void;
  onApproveAndPublish?: () => void;
}

export default function BlogQualityCheckModal({
  isOpen,
  onClose,
  blogData,
  onUpdateChecklist,
  onApproveAndPublish,
}: BlogQualityCheckModalProps) {
  if (!isOpen) return null;

  const report = evaluateBlogQuality(blogData);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121826] w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              report.score >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Editorial Compliance &amp; Review Guard
              </span>
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Content Quality Score: {report.score}%
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        {/* Informational banner (No fake score note) */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <span>
            This is an internal editorial compliance checklist designed to prevent thin, unverified, or keyword-stuffed content from entering production.
          </span>
        </div>

        {/* Quality Check Items List */}
        <div className="space-y-3">
          {report.items.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                item.passed
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-bold text-xs text-neutral-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {item.category}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pl-6">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Interactive checklist toggle for editorial confirmation */}
              {['noFakeClaims', 'researchComplete', 'factsVerified', 'sourcesAdded', 'priceChecked'].includes(item.id) && (
                <button
                  type="button"
                  onClick={() => onUpdateChecklist(item.id, !blogData.qualityChecklist[item.id])}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    blogData.qualityChecklist[item.id]
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300'
                  }`}
                >
                  {blogData.qualityChecklist[item.id] ? 'Confirmed ✓' : 'Confirm'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-xs">
            {report.allRequiredPassed ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All required editorial criteria passed!
              </span>
            ) : (
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Please fulfill all required items before publishing.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold"
            >
              Close
            </button>
            {onApproveAndPublish && (
              <button
                type="button"
                disabled={!report.readyForPublishing}
                onClick={onApproveAndPublish}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                Approve &amp; Publish Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
