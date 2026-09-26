'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, CheckCircle2, XCircle, EyeOff, Trash2,
  RefreshCw, Mail, MessageSquare, AlertCircle, Sparkles, Send, Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AdminModerationCenterPage() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'reports' | 'newsletter'>('reviews');
  const [loading, setLoading] = useState(true);

  // Reviews & Reports state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState('PENDING');

  // Newsletter Digest state
  const [digests, setDigests] = useState<any[]>([]);
  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [emailStatus, setEmailStatus] = useState<any>(null);

  const fetchReviewsData = () => {
    setLoading(true);
    fetch(`/api/admin/reviews?status=${reviewFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || []);
          setReports(data.reports || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchNewsletterData = () => {
    fetch('/api/admin/newsletter/digest')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDigests(data.digests || []);
          setEmailStatus(data.emailProvider);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchReviewsData();
    fetchNewsletterData();
  }, [reviewFilter]);

  const handleReviewAction = async (reviewId: string, action: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReviewsData();
      }
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  const handleReportAction = async (reportId: string, action: 'RESOLVE' | 'DISMISS') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReviewsData();
      }
    } catch (err) {
      console.error('Report resolution error:', err);
    }
  };

  const handleGenerateDigest = async () => {
    setGeneratingDigest(true);
    try {
      const res = await fetch('/api/admin/newsletter/digest', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchNewsletterData();
      }
    } catch (err) {
      console.error('Digest gen error:', err);
    } finally {
      setGeneratingDigest(false);
    }
  };

  const handleSendDigest = async (digestId: string) => {
    if (!confirm('Are you ready to send this newsletter digest?')) return;
    try {
      const res = await fetch('/api/admin/newsletter/digest', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digestId, action: 'SEND' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchNewsletterData();
      }
    } catch (err) {
      console.error('Digest send error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" /> Editorial Governance & Community Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Admin Moderation & Notification Hub
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Review user-submitted community ratings, resolve content abuse reports, and approve weekly newsletter drafts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchReviewsData();
            fetchNewsletterData();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-extrabold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queues</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reviews Queue ({reviews.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Abuse Reports ({reports.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'newsletter'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-purple-500" />
          <span>Weekly Newsletter Drafts ({digests.length})</span>
        </button>
      </div>

      {/* Tab 1: Reviews Moderation Queue */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">Filter by Status:</span>
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
              >
                <option value="PENDING">Pending Moderation</option>
                <option value="APPROVED">Approved Reviews</option>
                <option value="REJECTED">Rejected Reviews</option>
                <option value="HIDDEN">Hidden Reviews</option>
                <option value="ALL">All Statuses</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
            {reviews.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                No reviews found in this moderation view.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                            {rev.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[10px]">
                            ★ {rev.rating} / 5
                          </span>
                          {rev.isVerifiedBuyer && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              Verified Buyer
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase text-neutral-400">
                            [{rev.status}]
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Product: <strong>{rev.product?.name || 'General Product'}</strong> | Author: <strong>{rev.authorName}</strong> | Submitted: {new Date(rev.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {rev.status !== 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleReviewAction(rev.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {rev.status !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => handleReviewAction(rev.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleReviewAction(rev.id, 'DELETE')}
                          className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Flagged Community Content & Spam Reports
            </h3>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              No open abuse reports. All community reviews are clean.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {reports.map((rep) => (
                <div key={rep.id} className="p-6 space-y-2 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase">
                        Reason: {rep.reason}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        On Review: &ldquo;{rep.review?.title}&rdquo;
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Details: {rep.details || 'No additional comment provided by reporter.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReportAction(rep.id, 'RESOLVE')}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold"
                    >
                      Resolve & Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Newsletter Digests */}
      {activeTab === 'newsletter' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Weekly Newsletter Digest Draft Generator
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Automatically curates recent published articles, verified deals, and comparisons into a human-reviewable draft.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateDigest}
              disabled={generatingDigest}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generatingDigest ? 'Generating Draft...' : 'Generate New Weekly Digest Draft'}</span>
            </button>
          </div>

          {/* Email Provider status badge */}
          {emailStatus && (
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span><strong>Provider Status:</strong> {emailStatus.statusText}</span>
            </div>
          )}

          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
            {digests.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
                <p>No newsletter digests generated yet.</p>
                <p>Click &quot;Generate New Weekly Digest Draft&quot; above to create one from recent published articles.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {digests.map((dig) => (
                  <div key={dig.id} className="p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                            {dig.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              dig.status === 'SENT'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {dig.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Subject: {dig.subject}</p>
                      </div>

                      {dig.status !== 'SENT' && (
                        <button
                          type="button"
                          onClick={() => handleSendDigest(dig.id)}
                          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Digest
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
