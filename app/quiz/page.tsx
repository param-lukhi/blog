'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle, CheckCircle, ArrowRight, ArrowLeft, RotateCcw,
  Sparkles, ExternalLink, ShieldAlert, DollarSign, Battery,
  Camera, Zap, Headphones, Smartphone, Laptop, Dumbbell, Plane
} from 'lucide-react';

interface QuizResult {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string;
    images: string;
    features: string;
    pros: string;
    cons: string;
    affiliateUrl: string;
    amazonUrl: string;
    category?: { name: string; slug: string } | null;
    prices?: Array<{ storeName: string; storeSlug: string; price: number | null; affiliateUrl: string | null }>;
  };
  matchScore: number;
  matchReasons: string[];
}

export default function ProductBuyingQuizPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResult[] | null>(null);

  const [answers, setAnswers] = useState({
    budget: '10k_25k' as const,
    useCase: 'daily' as const,
    priorityFeature: 'battery' as const,
    brand: 'any',
    categorySlug: 'all',
  });

  const totalSteps = 5;

  const submitQuiz = async (finalAnswers = answers) => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.matches);
      }
    } catch (err) {
      console.error('Quiz submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      submitQuiz();
    }
  };

  const handleReset = () => {
    setResults(null);
    setStep(1);
    setAnswers({
      budget: '10k_25k',
      useCase: 'daily',
      priorityFeature: 'battery',
      brand: 'any',
      categorySlug: 'all',
    });
  };

  const parseImage = (imgJson: string) => {
    try {
      const arr = JSON.parse(imgJson);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : '/placeholder-product.png';
    } catch {
      return imgJson || '/placeholder-product.png';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Interactive Buying Advisor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Find the Right Product for Your Needs
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            Answer 5 quick questions about your budget, priority features, and daily use cases. Our rule-based recommendation engine will match you with verified products from our research catalog.
          </p>
        </div>

        {/* Quiz Stepper & Form */}
        {!results ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft p-6 sm:p-10 space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
                <span>Question {step} of {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
              </div>
              <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Question 1: Budget */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  1. What is your preferred budget range?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'under_10k', label: 'Under ₹10,000', desc: 'Entry-level / Value for money' },
                    { id: '10k_25k', label: '₹10,000 – ₹25,000', desc: 'Mid-range with balanced features' },
                    { id: '25k_50k', label: '₹25,000 – ₹50,000', desc: 'Upper mid-tier & premium specs' },
                    { id: '50k_plus', label: '₹50,000+', desc: 'Flagship tier with zero compromises' },
                    { id: 'any', label: 'Flexible / Any Budget', desc: 'Show best overall options across all tiers' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, budget: opt.id as any })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        answers.budget === opt.id
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-neutral-900 dark:text-white ring-2 ring-brand-500/20'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="font-bold text-sm">{opt.label}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2: Primary Use Case */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  2. What will you mainly use it for?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'daily', label: 'Everyday & Daily Commute', icon: Smartphone, desc: 'Calls, browsing, media, reliable battery' },
                    { id: 'gaming', label: 'Gaming & High Performance', icon: Zap, desc: 'Low latency, high FPS, powerful processing' },
                    { id: 'productivity', label: 'Work & Productivity', icon: Laptop, desc: 'Multitasking, long sessions, crisp display' },
                    { id: 'travel', label: 'Travel & Noise Cancellation', icon: Plane, desc: 'Compact, active noise cancelling, long battery' },
                    { id: 'fitness', label: 'Sports & Workouts', icon: Dumbbell, desc: 'Water resistance, secure fit, rugged build' },
                    { id: 'content_creation', label: 'Content Creation & Photography', icon: Camera, desc: 'Pro-grade sensors, 4K video, audio clarity' },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, useCase: opt.id as any })}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          answers.useCase === opt.id
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-neutral-900 dark:text-white ring-2 ring-brand-500/20'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">{opt.label}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Question 3: Priority Feature */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  3. Which single feature matters the most to you?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'battery', label: 'Long Battery Life & Fast Charging', icon: Battery },
                    { id: 'camera', label: 'Top-Tier Camera & Low-Light Sensors', icon: Camera },
                    { id: 'performance', label: 'Speed, RAM & Processing Power', icon: Zap },
                    { id: 'sound', label: 'Immersive Audio Quality & Strong Bass', icon: Headphones },
                    { id: 'durability', label: 'Waterproof & Rugged Durability', icon: ShieldAlert },
                    { id: 'value', label: 'Maximum Value for Money', icon: DollarSign },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, priorityFeature: opt.id as any })}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          answers.priorityFeature === opt.id
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-neutral-900 dark:text-white ring-2 ring-brand-500/20'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-brand-500 flex-shrink-0" />
                        <span className="font-bold text-sm">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Question 4: Category */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  4. Which product category are you looking for?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'all', label: 'All Categories (Recommend Best Match)' },
                    { id: 'smartphones', label: 'Smartphones & Mobile Devices' },
                    { id: 'audio', label: 'Earbuds, Headphones & Audio Gear' },
                    { id: 'laptops', label: 'Laptops & Computing' },
                    { id: 'wearables', label: 'Smartwatches & Fitness Trackers' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, categorySlug: opt.id })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        answers.categorySlug === opt.id
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-neutral-900 dark:text-white ring-2 ring-brand-500/20'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="font-bold text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 5: Preferred Brand */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  5. Do you have a preferred brand in mind?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'any', label: 'Any / Open to Suggestions' },
                    { id: 'Apple', label: 'Apple' },
                    { id: 'Samsung', label: 'Samsung' },
                    { id: 'Sony', label: 'Sony' },
                    { id: 'OnePlus', label: 'OnePlus' },
                    { id: 'Xiaomi', label: 'Xiaomi / Redmi' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, brand: opt.id })}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        answers.brand === opt.id
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-neutral-900 dark:text-white ring-2 ring-brand-500/20'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="font-bold text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <span>Analyzing Catalog...</span>
                ) : step === totalSteps ? (
                  <>
                    <span>View Matching Products</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Results View */
          <div className="space-y-8">
            {/* Explanatory Transparency Box */}
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-3xl p-6 text-brand-950 dark:text-brand-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-sm">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Why am I seeing these recommendations?</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start Over
                </button>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Products were matched using our deterministic rule engine based on your selected criteria: <strong>Budget: {answers.budget.replace('_', ' ')}</strong>, <strong>Primary Use Case: {answers.useCase}</strong>, and <strong>Priority: {answers.priorityFeature}</strong>. We do not declare arbitrary &quot;100% best&quot; winners.
              </p>
            </div>

            {/* Results Grid */}
            {results.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                  No direct matches found for this exact combination
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Try broadening your budget range or selecting &quot;All Categories&quot; to see relevant recommendations.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
                >
                  Retake Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((res, idx) => (
                  <div
                    key={res.product.id || idx}
                    className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft p-6 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Badge & Brand */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                          {res.product.brand}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                          {res.matchScore}% Match Score
                        </span>
                      </div>

                      {/* Product Title & Image */}
                      <div className="flex gap-4">
                        <img
                          src={parseImage(res.product.images)}
                          alt={res.product.name}
                          className="w-20 h-20 object-contain rounded-xl bg-neutral-50 dark:bg-neutral-800 p-2 flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white line-clamp-2">
                            {res.product.name}
                          </h3>
                          <div className="text-base font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                            {res.product.price}
                          </div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 space-y-1.5">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Why this matches your criteria:
                        </div>
                        {res.matchReasons.map((reason, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/products/${res.product.slug}`}
                          className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs text-center transition-all"
                        >
                          View Full Specs
                        </Link>
                        <a
                          href={res.product.affiliateUrl || res.product.amazonUrl || `/products/${res.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs text-center transition-all inline-flex items-center justify-center gap-1.5"
                        >
                          <span>Check Price</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Affiliate Disclosure */}
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-[11px] text-center">
              <strong>Affiliate Disclosure: </strong>
              BlogWeb904 participates in merchant affiliate programs. When you check prices or purchase through our links, we may earn an affiliate commission at no additional cost to you. Quiz recommendations are strictly rule-based and never influenced by merchant sponsorship.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
