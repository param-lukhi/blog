'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, ShieldCheck, Flag, CheckCircle2, MessageSquare,
  Sparkles, AlertCircle, X, Bookmark, Bell
} from 'lucide-react';

interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

interface ProductCommunityReviewsProps {
  productSlug: string;
  productId: string;
  productName: string;
  productPrice: string;
  productBrand: string;
  productImage?: string;
}

export default function ProductCommunityReviews({
  productSlug,
  productId,
  productName,
  productPrice,
  productBrand,
  productImage,
}: ProductCommunityReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Report modal state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Saved state
  const [isSaved, setIsSaved] = useState(false);

  // Load reviews from API
  const fetchReviews = () => {
    setLoading(true);
    fetch(`/api/products/${productSlug}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || []);
          setTotalReviews(data.totalReviews || 0);
          setAverageRating(data.averageRating || 0);
          setDistribution(data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
    try {
      const saved = localStorage.getItem('blogweb904_saved_products');
      if (saved) {
        const arr = JSON.parse(saved);
        if (arr.some((p: any) => p.id === productId || p.slug === productSlug)) {
          setIsSaved(true);
        }
      }
    } catch {}
  }, [productSlug, productId]);

  const toggleSaveProduct = () => {
    try {
      const saved = localStorage.getItem('blogweb904_saved_products');
      let arr = saved ? JSON.parse(saved) : [];
      if (isSaved) {
        arr = arr.filter((p: any) => p.id !== productId && p.slug !== productSlug);
        setIsSaved(false);
      } else {
        arr.push({
          id: productId,
          slug: productSlug,
          name: productName,
          price: productPrice,
          brand: productBrand,
          image: productImage,
          savedAt: new Date().toISOString(),
        });
        setIsSaved(true);
      }
      localStorage.setItem('blogweb904_saved_products', JSON.stringify(arr));
    } catch {}
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, email, rating, title, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage(data.message || 'Review submitted for moderation.');
        setAuthorName('');
        setEmail('');
        setTitle('');
        setContent('');
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setSubmitError(data.error || 'Failed to submit review.');
      }
    } catch {
      setSubmitError('Network error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReviewId) return;
    try {
      const res = await fetch(`/api/reviews/${reportingReviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportingReviewId(null);
          setReportSuccess(false);
          setReportDetails('');
        }, 1500);
      }
    } catch {}
  };

  return (
    <section className="my-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
      {/* Save & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-50 dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
        <div>
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Product Watchlist & Price Tracking
          </div>
          <div className="font-extrabold text-sm text-neutral-900 dark:text-white mt-0.5">
            Save {productName} to your research library
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSaveProduct}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isSaved
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
            <span>{isSaved ? 'Saved to Watchlist' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* Community Ratings & Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Community Insights & Feedback
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
            Community Ratings & User Reviews
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real feedback from verified buyers and community researchers. All reviews are independently moderated.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          Write a Review
        </button>
      </div>

      {/* Score & Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 text-center">
          <div className="text-5xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {averageRating > 0 ? averageRating : '-'}
          </div>
          <div className="flex items-center gap-1 my-2 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-400">
            Based on {totalReviews} approved review{totalReviews === 1 ? '' : 's'}
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 space-y-2 py-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-neutral-500 font-bold flex items-center gap-1">
                  <span>{star}</span> <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-neutral-400 font-mono text-[11px]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-neutral-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl p-8 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-2">
            <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
              No community reviews yet for this product.
            </p>
            <p className="text-xs text-neutral-400">
              Be the first to share your hands-on experience by clicking &ldquo;Write a Review&rdquo; above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{r.title}</h4>
                      {r.isVerifiedBuyer && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      By <strong>{r.authorName}</strong> on {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReportingReviewId(r.id)}
                    className="text-neutral-400 hover:text-rose-500 text-[11px] flex items-center gap-1"
                    title="Report review"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Report</span>
                  </button>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Review {productName}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitMessage ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">{submitMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${s <= rating ? 'fill-amber-400' : 'text-neutral-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-500 ml-2">{rating} out of 5</span>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Your Name</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Rahul S."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Email (Optional for Verified Buyer check) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Email Address (Private — used only for spam check & verified buyer badge)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Review Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Excellent ANC and battery life for daily commute"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Detailed Feedback</label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What did you like or dislike? How does it perform in real usage?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs">{submitError}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  {submitting ? 'Submitting Review...' : 'Submit for Editorial Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingReviewId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Report Community Review</h3>
            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-bold">
                Report received. Thank you for keeping our community clean.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs"
                  >
                    <option value="SPAM">Promotional Spam / Self-promotion</option>
                    <option value="ABUSE">Abusive or Inappropriate Language</option>
                    <option value="MISLEADING">False or Misleading Specifications</option>
                    <option value="OFF_TOPIC">Off-topic / Unrelated to Product</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Optional Details</label>
                  <textarea
                    rows={2}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Brief explanation..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingReviewId(null)}
                    className="px-4 py-2 rounded-xl border text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
